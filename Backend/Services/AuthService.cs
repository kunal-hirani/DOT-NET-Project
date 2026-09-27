using Backend.Common;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ICandidateRepository _candidateRepository;
    private readonly IElectionRepository _electionRepository;
    private readonly IHashService _hashService;
    private readonly ITokenService _tokenService;
    private readonly IAuditRepository _auditRepository;
    private readonly INotificationService _notificationService;

    public AuthService(
        IUserRepository userRepository,
        ICandidateRepository candidateRepository,
        IElectionRepository electionRepository,
        IHashService hashService,
        ITokenService tokenService,
        IAuditRepository auditRepository,
        INotificationService notificationService)
    {
        _userRepository = userRepository;
        _candidateRepository = candidateRepository;
        _electionRepository = electionRepository;
        _hashService = hashService;
        _tokenService = tokenService;
        _auditRepository = auditRepository;
        _notificationService = notificationService;
    }

    public async Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterAsync(RegisterRequestDto request)
    {
        var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
        if (existingEmail != null)
        {
            return (false, "An account with this email address already exists.", null);
        }

        var existingStudentId = await _userRepository.GetByStudentIdAsync(request.StudentId);
        if (existingStudentId != null)
        {
            return (false, "An account with this Student ID / Enrollment already exists.", null);
        }

        var passwordHash = _hashService.HashPassword(request.Password);
        var isCandidate = string.Equals(request.Role, UserRole.Candidate, StringComparison.OrdinalIgnoreCase) ||
                          string.Equals(request.Role, "Candidate", StringComparison.OrdinalIgnoreCase);

        var user = new User
        {
            StudentId = request.StudentId.Trim().ToUpperInvariant(),
            EnrollmentNo = string.IsNullOrWhiteSpace(request.EnrollmentNo) ? request.StudentId.Trim().ToUpperInvariant() : request.EnrollmentNo.Trim().ToUpperInvariant(),
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Department = request.Department.Trim(),
            Semester = request.Semester > 0 ? request.Semester : 1,
            ClassDivision = string.IsNullOrWhiteSpace(request.ClassDivision) ? "A" : request.ClassDivision.Trim().ToUpperInvariant(),
            PasswordHash = passwordHash,
            Role = isCandidate ? UserRole.Candidate : UserRole.Student,
            IsApproved = true,
            IsOtpVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        // If registering as a candidate, create the candidate record in the active/selected election
        if (isCandidate)
        {
            Election? targetElection = null;
            if (!string.IsNullOrWhiteSpace(request.ElectionId))
            {
                targetElection = await _electionRepository.GetByIdAsync(request.ElectionId);
            }
            if (targetElection == null)
            {
                var allElections = await _electionRepository.GetAllAsync();
                targetElection = allElections.FirstOrDefault(e => e.Status == ElectionStatus.Live || e.Status == ElectionStatus.Active)
                              ?? allElections.FirstOrDefault();
            }

            if (targetElection != null && !string.IsNullOrEmpty(targetElection.Id))
            {
                var chosenPosition = !string.IsNullOrWhiteSpace(request.Position)
                    ? request.Position.Trim()
                    : (targetElection.Positions.FirstOrDefault() ?? "President");

                var candidate = new Candidate
                {
                    ElectionId = targetElection.Id,
                    StudentId = user.StudentId,
                    FullName = user.FullName,
                    Department = user.Department,
                    Semester = user.Semester,
                    ClassDivision = user.ClassDivision,
                    Position = chosenPosition,
                    Manifesto = !string.IsNullOrWhiteSpace(request.Manifesto)
                        ? request.Manifesto.Trim()
                        : "Dedicated to student empowerment, campus development, and transparent student representation.",
                    SymbolUrl = !string.IsNullOrWhiteSpace(request.SymbolUrl) ? request.SymbolUrl.Trim() : "🌟",
                    PhotoUrl = $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(user.FullName)}",
                    Status = CandidateStatus.Approved,
                    ApprovalNotes = "Directly verified candidate registration.",
                    VoteCount = 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _candidateRepository.CreateAsync(candidate);
            }
        }

        await _auditRepository.LogAsync(
            action: isCandidate ? "CANDIDATE_REGISTERED" : "USER_REGISTERED",
            performedBy: user.Email,
            details: $"{(isCandidate ? "Candidate" : "Student")} registered: {user.FullName} ({user.StudentId}, {user.Department} Sem-{user.Semester})"
        );

        // Send Welcome in-system notification
        await _notificationService.SendNotificationAsync(new SendNotificationDto
        {
            Title = "Welcome to CollegeVote Portal",
            Message = $"Welcome {user.FullName}! Your student profile has been registered and verified for active elections.",
            Type = "ANNOUNCEMENT",
            TargetUserId = user.Id
        });

        var token = _tokenService.GenerateJwtToken(user, out var expiresAt);

        var response = new AuthResponseDto
        {
            Token = token,
            Id = user.Id ?? string.Empty,
            StudentId = user.StudentId,
            EnrollmentNo = user.EnrollmentNo,
            FullName = user.FullName,
            Email = user.Email,
            Department = user.Department,
            Semester = user.Semester,
            ClassDivision = user.ClassDivision,
            Role = user.Role,
            ExpiresAt = expiresAt
        };

        return (true, "Registration successful.", response);
    }

    public async Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.EmailOrStudentId);
        if (user == null)
        {
            user = await _userRepository.GetByStudentIdAsync(request.EmailOrStudentId);
        }

        if (user == null)
        {
            return (false, "Invalid credentials.", null);
        }

        if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
        {
            return (false, $"Account is temporarily locked due to multiple failed attempts. Try again after {user.LockoutUntil.Value.ToLocalTime():HH:mm:ss}.", null);
        }

        var isPasswordValid = _hashService.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(15);
                await _userRepository.UpdateAsync(user);
                await _auditRepository.LogAsync("ACCOUNT_LOCKED", user.Email, "Account locked due to 5 consecutive failed logins.");
                return (false, "Too many failed attempts. Account locked for 15 minutes.", null);
            }
            await _userRepository.UpdateAsync(user);
            return (false, "Invalid credentials.", null);
        }

        // Reset failed login counter on success
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        await _userRepository.UpdateAsync(user);

        if (!user.IsApproved)
        {
            return (false, "Your voter registration is currently pending administrator verification.", null);
        }

        var token = _tokenService.GenerateJwtToken(user, out var expiresAt);

        await _auditRepository.LogAsync(
            action: "USER_LOGIN",
            performedBy: user.Email,
            details: $"User logged in: {user.Email} (Role: {user.Role})"
        );

        var response = new AuthResponseDto
        {
            Token = token,
            Id = user.Id ?? string.Empty,
            StudentId = user.StudentId,
            EnrollmentNo = user.EnrollmentNo,
            FullName = user.FullName,
            Email = user.Email,
            Department = user.Department,
            Semester = user.Semester,
            ClassDivision = user.ClassDivision,
            Role = user.Role,
            ExpiresAt = expiresAt
        };

        return (true, "Login successful.", response);
    }

    public async Task<UserResponseDto?> GetUserProfileAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        return new UserResponseDto
        {
            Id = user.Id ?? string.Empty,
            StudentId = user.StudentId,
            EnrollmentNo = user.EnrollmentNo,
            FullName = user.FullName,
            Email = user.Email,
            Department = user.Department,
            Semester = user.Semester,
            ClassDivision = user.ClassDivision,
            Role = user.Role,
            IsApproved = user.IsApproved,
            IsOtpVerified = user.IsOtpVerified,
            CreatedAt = user.CreatedAt
        };
    }
}
