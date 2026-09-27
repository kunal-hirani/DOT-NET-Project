using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CreateElectionDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Department { get; set; } = "All";

    public List<string> EligibleDepartments { get; set; } = new() { "All" };

    public List<int> EligibleSemesters { get; set; } = new() { 1, 2, 3, 4, 5, 6, 7, 8 };

    public List<string> Positions { get; set; } = new() { "President", "Vice President", "General Secretary", "Sports Secretary", "Cultural Secretary" };

    public string Rules { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }
}

public class UpdateElectionDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Department { get; set; } = "All";

    public List<string>? EligibleDepartments { get; set; }

    public List<int>? EligibleSemesters { get; set; }

    public List<string>? Positions { get; set; }

    public string? Rules { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string Status { get; set; } = string.Empty;
}

public class PositionResultDto
{
    public string Position { get; set; } = string.Empty;
    public long TotalVotesForPosition { get; set; }
    public CandidateResponseDto? Winner { get; set; }
    public List<CandidateResponseDto> Candidates { get; set; } = new();
}

public class ElectionResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public List<string> EligibleDepartments { get; set; } = new();
    public List<int> EligibleSemesters { get; set; } = new();
    public List<string> Positions { get; set; } = new();
    public string Rules { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool HasCurrentUserVoted { get; set; }
    public List<string> VotedPositions { get; set; } = new();
    public List<CandidateResponseDto> Candidates { get; set; } = new();
    public List<PositionResultDto> PositionResults { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
