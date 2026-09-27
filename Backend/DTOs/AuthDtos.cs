using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public class RegisterRequestDto
{
    [Required]
    public string StudentId { get; set; } = string.Empty;

    public string EnrollmentNo { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Department { get; set; } = "Computer Science";

    public int Semester { get; set; } = 1;

    public string ClassDivision { get; set; } = "A";

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;

    public string? Role { get; set; } = "Student";

    public string? Position { get; set; }

    public string? Manifesto { get; set; }

    public string? SymbolUrl { get; set; }

    public string? ElectionId { get; set; }
}

public class LoginRequestDto
{
    [Required]
    public string EmailOrStudentId { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string EnrollmentNo { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int Semester { get; set; }
    public string ClassDivision { get; set; } = "A";
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string EnrollmentNo { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int Semester { get; set; }
    public string ClassDivision { get; set; } = "A";
    public string Role { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public bool IsOtpVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}
