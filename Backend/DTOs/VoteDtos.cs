using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CastVoteDto
{
    [Required]
    public string ElectionId { get; set; } = string.Empty;

    public string Position { get; set; } = "President";

    [Required]
    public string CandidateId { get; set; } = string.Empty;
}

public class VoteResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? ConfirmationReceipt { get; set; }
    public DateTime Timestamp { get; set; }
}

public class VoteStatusDto
{
    public string ElectionId { get; set; } = string.Empty;
    public bool HasVotedAny { get; set; }
    public List<string> VotedPositions { get; set; } = new();
    public List<string> RemainingPositions { get; set; } = new();
    public bool IsElectionActive { get; set; }
}
