using Backend.Common;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public interface IElectionService
{
    Task<List<ElectionResponseDto>> GetAllElectionsAsync(string? currentUserId = null, string? userRole = null);
    Task<List<ElectionResponseDto>> GetActiveElectionsAsync(string? currentUserId = null);
    Task<ElectionResponseDto?> GetElectionByIdAsync(string id, string? currentUserId = null);
    Task<(bool Success, string Message, ElectionResponseDto? Data)> CreateElectionAsync(CreateElectionDto dto, string adminEmail);
    Task<(bool Success, string Message, ElectionResponseDto? Data)> UpdateElectionAsync(string id, UpdateElectionDto dto, string adminEmail);
    Task<(bool Success, string Message)> UpdateElectionStatusAsync(string id, string newStatus, string adminEmail);
    Task<(bool Success, string Message)> DeleteElectionAsync(string id, string adminEmail);
}

public class ElectionService : IElectionService
{
    private readonly IElectionRepository _electionRepository;
    private readonly ICandidateRepository _candidateRepository;
    private readonly IVotingRepository _votingRepository;
    private readonly IUserRepository _userRepository;
    private readonly IHashService _hashService;
    private readonly IAuditRepository _auditRepository;
    private readonly INotificationService _notificationService;

    public ElectionService(
        IElectionRepository electionRepository,
        ICandidateRepository candidateRepository,
        IVotingRepository votingRepository,
        IUserRepository userRepository,
        IHashService hashService,
        IAuditRepository auditRepository,
        INotificationService notificationService)
    {
        _electionRepository = electionRepository;
        _candidateRepository = candidateRepository;
        _votingRepository = votingRepository;
        _userRepository = userRepository;
        _hashService = hashService;
        _auditRepository = auditRepository;
        _notificationService = notificationService;
    }

    public async Task<List<ElectionResponseDto>> GetAllElectionsAsync(string? currentUserId = null, string? userRole = null)
    {
        var elections = await _electionRepository.GetAllAsync();
        var dtos = new List<ElectionResponseDto>();

        foreach (var election in elections)
        {
            var dto = await MapToDtoAsync(election, currentUserId);
            dtos.Add(dto);
        }

        return dtos;
    }

    public async Task<List<ElectionResponseDto>> GetActiveElectionsAsync(string? currentUserId = null)
    {
        var elections = await _electionRepository.GetActiveElectionsAsync();
        var dtos = new List<ElectionResponseDto>();

        foreach (var election in elections)
        {
            var dto = await MapToDtoAsync(election, currentUserId);
            dtos.Add(dto);
        }

        return dtos;
    }

    public async Task<ElectionResponseDto?> GetElectionByIdAsync(string id, string? currentUserId = null)
    {
        var election = await _electionRepository.GetByIdAsync(id);
        if (election == null) return null;

        return await MapToDtoAsync(election, currentUserId);
    }

    public async Task<(bool Success, string Message, ElectionResponseDto? Data)> CreateElectionAsync(CreateElectionDto dto, string adminEmail)
    {
        if (dto.EndDate <= dto.StartDate)
        {
            return (false, "End date must be after start date.", null);
        }

        var election = new Election
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Department = string.IsNullOrWhiteSpace(dto.Department) ? "All" : dto.Department.Trim(),
            EligibleDepartments = dto.EligibleDepartments?.Count > 0 ? dto.EligibleDepartments : new List<string> { "All" },
            EligibleSemesters = dto.EligibleSemesters?.Count > 0 ? dto.EligibleSemesters : new List<int> { 1, 2, 3, 4, 5, 6, 7, 8 },
            Positions = dto.Positions?.Count > 0 ? dto.Positions : new List<string> { "President", "Vice President", "General Secretary", "Sports Secretary" },
            Rules = string.IsNullOrWhiteSpace(dto.Rules) ? "1. One vote per position.\n2. Cryptographic anonymity guaranteed.\n3. Votes once cast cannot be changed." : dto.Rules.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = ElectionStatus.Upcoming,
            ElectionSalt = Guid.NewGuid().ToString("N"),
            CreatedAt = DateTime.UtcNow
        };

        await _electionRepository.CreateAsync(election);

        await _auditRepository.LogAsync(
            action: "ELECTION_CREATED",
            performedBy: adminEmail,
            details: $"Election '{election.Title}' created with {election.Positions.Count} contested positions."
        );

        // Broadcast notification to all students
        await _notificationService.SendNotificationAsync(new SendNotificationDto
        {
            Title = "New Election Announced",
            Message = $"The election committee has announced '{election.Title}'. Check your eligibility and candidate nominations.",
            Type = "ANNOUNCEMENT",
            ElectionId = election.Id
        });

        var responseDto = await MapToDtoAsync(election, null);
        return (true, "Election created successfully.", responseDto);
    }

    public async Task<(bool Success, string Message, ElectionResponseDto? Data)> UpdateElectionAsync(string id, UpdateElectionDto dto, string adminEmail)
    {
        var election = await _electionRepository.GetByIdAsync(id);
        if (election == null)
        {
            return (false, "Election not found.", null);
        }

        election.Title = dto.Title.Trim();
        election.Description = dto.Description.Trim();
        election.Department = string.IsNullOrWhiteSpace(dto.Department) ? "All" : dto.Department.Trim();
        if (dto.EligibleDepartments != null) election.EligibleDepartments = dto.EligibleDepartments;
        if (dto.EligibleSemesters != null) election.EligibleSemesters = dto.EligibleSemesters;
        if (dto.Positions != null && dto.Positions.Count > 0) election.Positions = dto.Positions;
        if (!string.IsNullOrEmpty(dto.Rules)) election.Rules = dto.Rules;
        if (dto.StartDate != default) election.StartDate = dto.StartDate;
        if (dto.EndDate != default) election.EndDate = dto.EndDate;
        if (!string.IsNullOrEmpty(dto.Status)) election.Status = dto.Status;

        await _electionRepository.UpdateAsync(election);

        await _auditRepository.LogAsync(
            action: "ELECTION_UPDATED",
            performedBy: adminEmail,
            details: $"Election '{election.Title}' (ID: {election.Id}) updated."
        );

        var responseDto = await MapToDtoAsync(election, null);
        return (true, "Election updated successfully.", responseDto);
    }

    public async Task<(bool Success, string Message)> UpdateElectionStatusAsync(string id, string newStatus, string adminEmail)
    {
        var election = await _electionRepository.GetByIdAsync(id);
        if (election == null)
        {
            return (false, "Election not found.");
        }

        election.Status = newStatus;
        await _electionRepository.UpdateAsync(election);

        await _auditRepository.LogAsync(
            action: "ELECTION_STATUS_CHANGED",
            performedBy: adminEmail,
            details: $"Election '{election.Title}' status changed to {newStatus}."
        );

        // Send notification depending on state
        if (newStatus == ElectionStatus.Live || newStatus == ElectionStatus.Active)
        {
            await _notificationService.SendNotificationAsync(new SendNotificationDto
            {
                Title = "Voting is NOW LIVE! 🗳️",
                Message = $"Voting is officially open for '{election.Title}'. Cast your anonymous ballot now before the deadline.",
                Type = "VOTING_START",
                ElectionId = election.Id
            });
        }
        else if (newStatus == ElectionStatus.Completed)
        {
            await _notificationService.SendNotificationAsync(new SendNotificationDto
            {
                Title = "Election Results Declared! 🏆",
                Message = $"Voting for '{election.Title}' has concluded. View official election winners and live tallies now.",
                Type = "RESULTS",
                ElectionId = election.Id
            });
        }

        return (true, $"Election status updated to {newStatus}.");
    }

    public async Task<(bool Success, string Message)> DeleteElectionAsync(string id, string adminEmail)
    {
        var election = await _electionRepository.GetByIdAsync(id);
        if (election == null)
        {
            return (false, "Election not found.");
        }

        await _electionRepository.DeleteAsync(id);

        await _auditRepository.LogAsync(
            action: "ELECTION_DELETED",
            performedBy: adminEmail,
            details: $"Election '{election.Title}' was deleted."
        );

        return (true, "Election deleted successfully.");
    }

    private async Task<ElectionResponseDto> MapToDtoAsync(Election election, string? currentUserId)
    {
        var candidates = await _candidateRepository.GetByElectionIdAsync(election.Id!, CandidateStatus.Approved);
        var totalVotes = candidates.Sum(c => c.VoteCount);

        var votedPositions = new List<string>();
        if (!string.IsNullOrEmpty(currentUserId))
        {
            var user = await _userRepository.GetByIdAsync(currentUserId);
            if (user != null)
            {
                var voterToken = _hashService.GenerateVoterToken(user.StudentId, election.Id!, election.ElectionSalt);
                votedPositions = await _votingRepository.GetVotedPositionsAsync(election.Id!, voterToken);
            }
        }

        // Group by position
        var positionResults = new List<PositionResultDto>();
        var positions = election.Positions?.Count > 0 ? election.Positions : candidates.Select(c => c.Position).Distinct().ToList();
        if (positions.Count == 0) positions.Add("General");

        foreach (var pos in positions)
        {
            var posCandidates = candidates.Where(c => c.Position == pos).ToList();
            var posVotes = posCandidates.Sum(c => c.VoteCount);

            var candidateDtos = posCandidates.Select(c => new CandidateResponseDto
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
                VotePercentage = posVotes > 0 ? Math.Round((double)c.VoteCount / posVotes * 100, 1) : 0
            }).OrderByDescending(c => c.VoteCount).ToList();

            // Determine winner if election is completed and has votes
            CandidateResponseDto? winner = null;
            if (election.Status == ElectionStatus.Completed && candidateDtos.Count > 0 && candidateDtos[0].VoteCount > 0)
            {
                candidateDtos[0].IsWinner = true;
                winner = candidateDtos[0];
            }

            positionResults.Add(new PositionResultDto
            {
                Position = pos,
                TotalVotesForPosition = posVotes,
                Winner = winner,
                Candidates = candidateDtos
            });
        }

        var allCandidateDtos = candidates.Select(c => new CandidateResponseDto
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

        var hasVotedAll = positions.Count > 0 && positions.All(p => votedPositions.Contains(p));

        return new ElectionResponseDto
        {
            Id = election.Id ?? string.Empty,
            Title = election.Title,
            Description = election.Description,
            Department = election.Department,
            EligibleDepartments = election.EligibleDepartments,
            EligibleSemesters = election.EligibleSemesters,
            Positions = election.Positions,
            Rules = election.Rules,
            StartDate = election.StartDate,
            EndDate = election.EndDate,
            Status = election.Status,
            HasCurrentUserVoted = hasVotedAll,
            VotedPositions = votedPositions,
            Candidates = allCandidateDtos,
            PositionResults = positionResults,
            CreatedAt = election.CreatedAt
        };
    }
}
