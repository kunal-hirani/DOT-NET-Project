using Backend.Common;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public interface ICandidateService
{
    Task<List<CandidateResponseDto>> GetCandidatesByElectionAsync(string electionId, string? status = null);
    Task<List<CandidateResponseDto>> GetPendingCandidatesAsync();
    Task<CandidateResponseDto?> GetCandidateByIdAsync(string id);
    Task<(bool Success, string Message, CandidateResponseDto? Data)> AddCandidateAsync(CreateCandidateDto dto, string adminEmail, bool autoApprove = true);
    Task<(bool Success, string Message, CandidateResponseDto? Data)> NominateSelfAsync(string studentId, NominateSelfDto dto);
    Task<(bool Success, string Message)> UpdateCandidateStatusAsync(string id, CandidateStatusUpdateDto dto, string adminEmail);
    Task<(bool Success, string Message)> RemoveCandidateAsync(string id, string adminEmail);
}

public class CandidateService : ICandidateService
{
    private readonly ICandidateRepository _candidateRepository;
    private readonly IElectionRepository _electionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAuditRepository _auditRepository;
    private readonly INotificationService _notificationService;

    public CandidateService(
        ICandidateRepository candidateRepository,
        IElectionRepository electionRepository,
        IUserRepository userRepository,
        IAuditRepository auditRepository,
        INotificationService notificationService)
    {
        _candidateRepository = candidateRepository;
        _electionRepository = electionRepository;
        _userRepository = userRepository;
        _auditRepository = auditRepository;
        _notificationService = notificationService;
    }

    public async Task<List<CandidateResponseDto>> GetCandidatesByElectionAsync(string electionId, string? status = null)
    {
        var candidates = await _candidateRepository.GetByElectionIdAsync(electionId, status ?? CandidateStatus.Approved);
        var totalVotes = candidates.Sum(c => c.VoteCount);

        return candidates.Select(c => MapToDto(c, totalVotes)).ToList();
    }

    public async Task<List<CandidateResponseDto>> GetPendingCandidatesAsync()
    {
        var pending = await _candidateRepository.GetPendingCandidatesAsync();
        return pending.Select(c => MapToDto(c, 0)).ToList();
    }

    public async Task<CandidateResponseDto?> GetCandidateByIdAsync(string id)
    {
        var candidate = await _candidateRepository.GetByIdAsync(id);
        if (candidate == null) return null;

        var allCandidates = await _candidateRepository.GetByElectionIdAsync(candidate.ElectionId, CandidateStatus.Approved);
        var totalVotes = allCandidates.Sum(c => c.VoteCount);

        return MapToDto(candidate, totalVotes);
    }

    public async Task<(bool Success, string Message, CandidateResponseDto? Data)> AddCandidateAsync(CreateCandidateDto dto, string adminEmail, bool autoApprove = true)
    {
        var election = await _electionRepository.GetByIdAsync(dto.ElectionId);
        if (election == null)
        {
            return (false, "Election does not exist.", null);
        }

        var existing = await _candidateRepository.GetByElectionAndStudentIdAsync(dto.ElectionId, dto.StudentId);
        if (existing != null)
        {
            return (false, "This student is already nominated as a candidate for this election.", null);
        }

        var candidate = new Candidate
        {
            ElectionId = dto.ElectionId,
            StudentId = dto.StudentId.Trim().ToUpperInvariant(),
            FullName = dto.FullName.Trim(),
            Position = string.IsNullOrWhiteSpace(dto.Position) ? "President" : dto.Position.Trim(),
            Department = dto.Department.Trim(),
            Semester = dto.Semester > 0 ? dto.Semester : 1,
            ClassDivision = dto.ClassDivision.Trim().ToUpperInvariant(),
            Manifesto = dto.Manifesto.Trim(),
            PhotoUrl = dto.PhotoUrl.Trim(),
            SymbolUrl = string.IsNullOrWhiteSpace(dto.SymbolUrl) ? "🌟" : dto.SymbolUrl.Trim(),
            Status = autoApprove ? CandidateStatus.Approved : CandidateStatus.Pending,
            VoteCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _candidateRepository.CreateAsync(candidate);

        await _auditRepository.LogAsync(
            action: "CANDIDATE_NOMINATED",
            performedBy: adminEmail,
            details: $"Candidate '{candidate.FullName}' ({candidate.Position}) nominated for election '{election.Title}' (Status: {candidate.Status})."
        );

        return (true, "Candidate nomination submitted.", MapToDto(candidate, 0));
    }

    public async Task<(bool Success, string Message, CandidateResponseDto? Data)> NominateSelfAsync(string studentId, NominateSelfDto dto)
    {
        var user = await _userRepository.GetByStudentIdAsync(studentId);
        if (user == null)
        {
            return (false, "Student account not found.", null);
        }

        var createDto = new CreateCandidateDto
        {
            ElectionId = dto.ElectionId,
            StudentId = studentId,
            FullName = user.FullName,
            Position = dto.Position,
            Department = user.Department,
            Semester = user.Semester,
            ClassDivision = user.ClassDivision,
            Manifesto = dto.Manifesto,
            PhotoUrl = dto.PhotoUrl,
            SymbolUrl = dto.SymbolUrl
        };

        return await AddCandidateAsync(createDto, user.Email, autoApprove: false);
    }

    public async Task<(bool Success, string Message)> UpdateCandidateStatusAsync(string id, CandidateStatusUpdateDto dto, string adminEmail)
    {
        var candidate = await _candidateRepository.GetByIdAsync(id);
        if (candidate == null)
        {
            return (false, "Candidate application not found.");
        }

        await _candidateRepository.UpdateStatusAsync(id, dto.Status, dto.Notes);

        var user = await _userRepository.GetByStudentIdAsync(candidate.StudentId);
        if (user != null && dto.Status == CandidateStatus.Approved)
        {
            user.Role = UserRole.Candidate;
            await _userRepository.UpdateAsync(user);
        }

        // Notify the student
        if (user != null)
        {
            await _notificationService.SendNotificationAsync(new SendNotificationDto
            {
                Title = $"Candidacy Nomination {dto.Status}",
                Message = dto.Status == CandidateStatus.Approved
                    ? $"Congratulations! Your nomination for the position of '{candidate.Position}' has been approved by the Election Committee."
                    : $"Your nomination for '{candidate.Position}' was reviewed: {dto.Notes}",
                Type = "APPROVAL",
                TargetUserId = user.Id,
                ElectionId = candidate.ElectionId
            });
        }

        await _auditRepository.LogAsync(
            action: "CANDIDATE_STATUS_UPDATED",
            performedBy: adminEmail,
            details: $"Candidate {candidate.FullName} status set to {dto.Status} ({dto.Notes})"
        );

        return (true, $"Candidate nomination status updated to {dto.Status}.");
    }

    public async Task<(bool Success, string Message)> RemoveCandidateAsync(string id, string adminEmail)
    {
        var candidate = await _candidateRepository.GetByIdAsync(id);
        if (candidate == null)
        {
            return (false, "Candidate not found.");
        }

        await _candidateRepository.DeleteAsync(id);

        await _auditRepository.LogAsync(
            action: "CANDIDATE_REMOVED",
            performedBy: adminEmail,
            details: $"Candidate '{candidate.FullName}' (ID: {id}) was removed."
        );

        return (true, "Candidate removed successfully.");
    }

    private static CandidateResponseDto MapToDto(Candidate c, int totalVotes)
    {
        return new CandidateResponseDto
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
            Status = c.Status,
            ApprovalNotes = c.ApprovalNotes,
            VoteCount = c.VoteCount,
            VotePercentage = totalVotes > 0 ? Math.Round((double)c.VoteCount / totalVotes * 100, 1) : 0
        };
    }
}
