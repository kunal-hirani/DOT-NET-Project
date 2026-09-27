using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class CreateCandidateDto
{
    [Required]
    public string ElectionId { get; set; } = string.Empty;

    public string StudentId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    [Required]
    public string Position { get; set; } = "President";

    public string Department { get; set; } = string.Empty;

    public int Semester { get; set; } = 1;

    public string ClassDivision { get; set; } = "A";

    public string Manifesto { get; set; } = string.Empty;

    public string PhotoUrl { get; set; } = string.Empty;

    public string SymbolUrl { get; set; } = "🌟";
}

public class NominateSelfDto
{
    [Required]
    public string ElectionId { get; set; } = string.Empty;

    [Required]
    public string Position { get; set; } = "President";

    public string Manifesto { get; set; } = string.Empty;

    public string PhotoUrl { get; set; } = string.Empty;

    public string SymbolUrl { get; set; } = "🌟";
}

public class CandidateStatusUpdateDto
{
    [Required]
    public string Status { get; set; } = "Approved"; // "Approved" | "Rejected"

    public string Notes { get; set; } = string.Empty;
}

public class CandidateResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string ElectionId { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = "President";
    public string Department { get; set; } = string.Empty;
    public int Semester { get; set; }
    public string ClassDivision { get; set; } = "A";
    public string Manifesto { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public string SymbolUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Approved";
    public string ApprovalNotes { get; set; } = string.Empty;
    public int VoteCount { get; set; }
    public double VotePercentage { get; set; }
    public bool IsWinner { get; set; } = false;
}
