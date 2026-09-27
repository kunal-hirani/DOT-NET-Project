using Backend.Common;
using Backend.DTOs;
using Backend.Hubs;
using Backend.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public interface IVotingService
{
    Task<(bool Success, string Message, VoteResultDto? Data)> CastVoteAsync(string userId, CastVoteDto dto, string ipAddress);
    Task<VoteStatusDto> GetVoteStatusAsync(string userId, string electionId);
}

public class VotingService : IVotingService
{
    private readonly IVotingRepository _votingRepository;
    private readonly IElectionRepository _electionRepository;
    private readonly ICandidateRepository _candidateRepository;
    private readonly IUserRepository _userRepository;
    private readonly IHashService _hashService;
    private readonly IAuditRepository _auditRepository;
    private readonly IHubContext<ElectionHub> _hubContext;

    public VotingService(
        IVotingRepository votingRepository,
        IElectionRepository electionRepository,
        ICandidateRepository candidateRepository,
        IUserRepository userRepository,
        IHashService hashService,
        IAuditRepository auditRepository,
        IHubContext<ElectionHub> hubContext)
    {
        _votingRepository = votingRepository;
        _electionRepository = electionRepository;
        _candidateRepository = candidateRepository;
        _userRepository = userRepository;
        _hashService = hashService;
        _auditRepository = auditRepository;
        _hubContext = hubContext;
    }

    public async Task<(bool Success, string Message, VoteResultDto? Data)> CastVoteAsync(string userId, CastVoteDto dto, string ipAddress)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsApproved)
        {
            return (false, "Voter account is not approved or does not exist.", null);
        }

        var election = await _electionRepository.GetByIdAsync(dto.ElectionId);
        if (election == null)
        {
            return (false, "Election not found.", null);
        }

        var now = DateTime.UtcNow;
        var isLive = (election.Status == ElectionStatus.Active || election.Status == ElectionStatus.Live) && now >= election.StartDate && now <= election.EndDate;
        if (!isLive)
        {
            return (false, "This election is currently not accepting votes (Closed or Paused).", null);
        }

        // Check department eligibility
        if (election.EligibleDepartments != null && 
            !election.EligibleDepartments.Contains("All") && 
            !election.EligibleDepartments.Contains(user.Department, StringComparer.OrdinalIgnoreCase))
        {
            return (false, $"Eligibility check failed: This election is restricted to students of: {string.Join(", ", election.EligibleDepartments)}.", null);
        }

        // Check semester eligibility
        if (election.EligibleSemesters != null && 
            election.EligibleSemesters.Count > 0 && 
            !election.EligibleSemesters.Contains(user.Semester))
        {
            return (false, $"Eligibility check failed: This election is restricted to Semesters: {string.Join(", ", election.EligibleSemesters)}.", null);
        }

        // Validate candidate
        var candidate = await _candidateRepository.GetByIdAsync(dto.CandidateId);
        if (candidate == null || candidate.ElectionId != dto.ElectionId)
        {
            return (false, "Selected candidate does not belong to this election.", null);
        }

        var position = string.IsNullOrWhiteSpace(dto.Position) ? candidate.Position : dto.Position.Trim();

        // Generate deterministic Voter Privacy Token: HMAC-SHA256(StudentId:ElectionId, ElectionSalt)
        var voterToken = _hashService.GenerateVoterToken(user.StudentId, election.Id!, election.ElectionSalt);

        // Check if student already voted for this specific position
        var alreadyVoted = await _votingRepository.HasVotedAsync(dto.ElectionId, position, voterToken);
        if (alreadyVoted)
        {
            return (false, $"You have already cast your ballot for the '{position}' position in this election.", null);
        }

        // Atomic write
        var voteRecorded = await _votingRepository.RecordVoteAsync(dto.ElectionId, position, candidate.Id!, voterToken);
        if (!voteRecorded)
        {
            return (false, "A duplicate vote attempt was detected and rejected by the security engine.", null);
        }

        var receipt = $"RECEIPT-{position[..Math.Min(3, position.Length)].ToUpperInvariant()}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";

        await _auditRepository.LogAsync(
            action: "VOTE_CAST",
            performedBy: $"Student: {user.StudentId[..3]}*** ({user.Department})",
            details: $"Vote cast for '{position}' in '{election.Title}'. Confirmation: {receipt}",
            ipAddress: ipAddress
        );

        _ = BroadcastLiveUpdateAsync(election.Id!);

        var result = new VoteResultDto
        {
            Success = true,
            Position = position,
            Message = $"Your vote for {position} has been securely and anonymously cast.",
            ConfirmationReceipt = receipt,
            Timestamp = DateTime.UtcNow
        };

        return (true, "Vote recorded successfully.", result);
    }

    public async Task<VoteStatusDto> GetVoteStatusAsync(string userId, string electionId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        var election = await _electionRepository.GetByIdAsync(electionId);

        if (user == null || election == null)
        {
            return new VoteStatusDto { ElectionId = electionId, HasVotedAny = false, IsElectionActive = false };
        }

        var voterToken = _hashService.GenerateVoterToken(user.StudentId, election.Id!, election.ElectionSalt);
        var votedPositions = await _votingRepository.GetVotedPositionsAsync(electionId, voterToken);

        var allPositions = election.Positions?.Count > 0 ? election.Positions : new List<string> { "President" };
        var remainingPositions = allPositions.Except(votedPositions).ToList();

        var now = DateTime.UtcNow;
        var isActive = (election.Status == ElectionStatus.Active || election.Status == ElectionStatus.Live) && now >= election.StartDate && now <= election.EndDate;

        return new VoteStatusDto
        {
            ElectionId = electionId,
            HasVotedAny = votedPositions.Count > 0,
            VotedPositions = votedPositions,
            RemainingPositions = remainingPositions,
            IsElectionActive = isActive
        };
    }

    private async Task BroadcastLiveUpdateAsync(string electionId)
    {
        try
        {
            var election = await _electionRepository.GetByIdAsync(electionId);
            if (election == null) return;

            var candidates = await _candidateRepository.GetByElectionIdAsync(electionId, CandidateStatus.Approved);
            var totalVotes = candidates.Sum(c => c.VoteCount);

            var candidateDtos = candidates.Select(c => new CandidateResponseDto
            {
                Id = c.Id ?? string.Empty,
                ElectionId = c.ElectionId,
                StudentId = c.StudentId,
                FullName = c.FullName,
                Position = c.Position,
                Department = c.Department,
                Semester = c.Semester,
                ClassDivision = c.ClassDivision,
                Manifesto = c.Manifesto,
                PhotoUrl = c.PhotoUrl,
                SymbolUrl = c.SymbolUrl,
                VoteCount = c.VoteCount,
                VotePercentage = totalVotes > 0 ? Math.Round((double)c.VoteCount / totalVotes * 100, 1) : 0
            }).ToList();

            var liveResult = new LiveElectionResultDto
            {
                ElectionId = electionId,
                ElectionTitle = election.Title,
                Status = election.Status,
                TotalVotes = totalVotes,
                Candidates = candidateDtos,
                LastUpdated = DateTime.UtcNow
            };

            await _hubContext.Clients.Group($"election-{electionId}").SendAsync("ReceiveVoteUpdate", liveResult);
            await _hubContext.Clients.Group("admin-dashboard").SendAsync("ReceiveDashboardUpdate", liveResult);
        }
        catch
        {
            // Ignored
        }
    }
}
