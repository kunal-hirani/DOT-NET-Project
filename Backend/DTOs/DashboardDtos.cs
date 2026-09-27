using Backend.Models;

namespace Backend.DTOs;

public class AdminDashboardSummaryDto
{
    public long TotalVoters { get; set; }
    public long TotalCandidates { get; set; }
    public long TotalElections { get; set; }
    public long ActiveElections { get; set; }
    public long CompletedElections { get; set; }
    public long TotalVotesCast { get; set; }
    public List<AuditLog> RecentActivity { get; set; } = new();
}

public class LiveElectionResultDto
{
    public string ElectionId { get; set; } = string.Empty;
    public string ElectionTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public long TotalVotes { get; set; }
    public List<CandidateResponseDto> Candidates { get; set; } = new();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
