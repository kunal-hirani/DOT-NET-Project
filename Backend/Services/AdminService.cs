using System.Text;
using Backend.Common;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public interface IAdminService
{
    Task<AdminDashboardSummaryDto> GetDashboardSummaryAsync();
    Task<LiveElectionResultDto?> GetLiveElectionResultAsync(string electionId);
    Task<List<UserResponseDto>> GetAllUsersAsync();
    Task<(bool Success, string Message)> ToggleUserApprovalAsync(string userId, bool isApproved, string adminEmail);
    Task<(bool Success, string Message)> UpdateUserRoleAsync(string userId, string newRole, string adminEmail);
    Task<string> GenerateElectionResultsCsvAsync(string electionId);
    Task<string> GenerateVoterTurnoutCsvAsync(string electionId);
}

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IElectionRepository _electionRepository;
    private readonly ICandidateRepository _candidateRepository;
    private readonly IVotingRepository _votingRepository;
    private readonly IAuditRepository _auditRepository;

    public AdminService(
        IUserRepository userRepository,
        IElectionRepository electionRepository,
        ICandidateRepository candidateRepository,
        IVotingRepository votingRepository,
        IAuditRepository auditRepository)
    {
        _userRepository = userRepository;
        _electionRepository = electionRepository;
        _candidateRepository = candidateRepository;
        _votingRepository = votingRepository;
        _auditRepository = auditRepository;
    }

    public async Task<AdminDashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var totalVoters = await _userRepository.GetTotalCountAsync();
        var totalCandidates = await _candidateRepository.GetTotalCountAsync();
        var totalElections = await _electionRepository.GetTotalCountAsync();
        var activeElections = await _electionRepository.GetCountByStatusAsync(ElectionStatus.Live);
        if (activeElections == 0) activeElections = await _electionRepository.GetCountByStatusAsync(ElectionStatus.Active);
        var completedElections = await _electionRepository.GetCountByStatusAsync(ElectionStatus.Completed);
        var totalVotes = await _votingRepository.GetTotalVotesCountAsync();
        var recentLogs = await _auditRepository.GetRecentLogsAsync(20);

        return new AdminDashboardSummaryDto
        {
            TotalVoters = totalVoters,
            TotalCandidates = totalCandidates,
            TotalElections = totalElections,
            ActiveElections = activeElections,
            CompletedElections = completedElections,
            TotalVotesCast = totalVotes,
            RecentActivity = recentLogs
        };
    }

    public async Task<LiveElectionResultDto?> GetLiveElectionResultAsync(string electionId)
    {
        var election = await _electionRepository.GetByIdAsync(electionId);
        if (election == null) return null;

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
        }).OrderByDescending(c => c.VoteCount).ToList();

        return new LiveElectionResultDto
        {
            ElectionId = election.Id ?? string.Empty,
            ElectionTitle = election.Title,
            Status = election.Status,
            TotalVotes = totalVotes,
            Candidates = candidateDtos,
            LastUpdated = DateTime.UtcNow
        };
    }

    public async Task<List<UserResponseDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => new UserResponseDto
        {
            Id = u.Id ?? string.Empty,
            StudentId = u.StudentId,
            EnrollmentNo = u.EnrollmentNo,
            FullName = u.FullName,
            Email = u.Email,
            Department = u.Department,
            Semester = u.Semester,
            ClassDivision = u.ClassDivision,
            Role = u.Role,
            IsApproved = u.IsApproved,
            IsOtpVerified = u.IsOtpVerified,
            CreatedAt = u.CreatedAt
        }).OrderByDescending(u => u.CreatedAt).ToList();
    }

    public async Task<(bool Success, string Message)> ToggleUserApprovalAsync(string userId, bool isApproved, string adminEmail)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found.");
        }

        user.IsApproved = isApproved;
        await _userRepository.UpdateAsync(user);

        await _auditRepository.LogAsync(
            action: isApproved ? "USER_APPROVED" : "USER_SUSPENDED",
            performedBy: adminEmail,
            details: $"User {user.Email} ({user.StudentId}) approval status updated to {isApproved}."
        );

        return (true, $"User verification status updated to {isApproved}.");
    }

    public async Task<(bool Success, string Message)> UpdateUserRoleAsync(string userId, string newRole, string adminEmail)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return (false, "User not found.");
        }

        user.Role = newRole;
        await _userRepository.UpdateAsync(user);

        await _auditRepository.LogAsync(
            action: "USER_ROLE_CHANGED",
            performedBy: adminEmail,
            details: $"User {user.Email} role changed to {newRole}."
        );

        return (true, $"User role updated to {newRole}.");
    }

    public async Task<string> GenerateElectionResultsCsvAsync(string electionId)
    {
        var election = await _electionRepository.GetByIdAsync(electionId);
        if (election == null) return string.Empty;

        var candidates = await _candidateRepository.GetByElectionIdAsync(electionId, CandidateStatus.Approved);
        var totalVotes = candidates.Sum(c => c.VoteCount);

        var sb = new StringBuilder();
        sb.AppendLine("Election Title,Position,Candidate Name,Student ID,Department,Semester,Votes,Percentage");

        foreach (var c in candidates.OrderBy(c => c.Position).ThenByDescending(c => c.VoteCount))
        {
            var pct = totalVotes > 0 ? (double)c.VoteCount / totalVotes * 100 : 0;
            sb.AppendLine($"\"{election.Title}\",\"{c.Position}\",\"{c.FullName}\",\"{c.StudentId}\",\"{c.Department}\",{c.Semester},{c.VoteCount},{pct:F2}%");
        }

        return sb.ToString();
    }

    public async Task<string> GenerateVoterTurnoutCsvAsync(string electionId)
    {
        var election = await _electionRepository.GetByIdAsync(electionId);
        if (election == null) return string.Empty;

        var users = await _userRepository.GetAllAsync();
        var votes = await _votingRepository.GetVotesByElectionAsync(electionId);

        var sb = new StringBuilder();
        sb.AppendLine("Metric,Value");
        sb.AppendLine($"Election Title,\"{election.Title}\"");
        sb.AppendLine($"Status,{election.Status}");
        sb.AppendLine($"Total Registered Students,{users.Count}");
        sb.AppendLine($"Total Ballots Cast,{votes.Count}");
        var pct = users.Count > 0 ? (double)votes.Count / users.Count * 100 : 0;
        sb.AppendLine($"Overall Voter Turnout,{pct:F2}%");

        return sb.ToString();
    }
}
