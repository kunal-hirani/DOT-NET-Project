using System.Security.Claims;
using Backend.Common;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandidatesController : ControllerBase
{
    private readonly ICandidateService _candidateService;

    public CandidatesController(ICandidateService candidateService)
    {
        _candidateService = candidateService;
    }

    /// <summary>
    /// Get all approved candidates for a specific election
    /// </summary>
    [HttpGet("election/{electionId}")]
    [ProducesResponseType(typeof(List<CandidateResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByElection(string electionId)
    {
        var candidates = await _candidateService.GetCandidatesByElectionAsync(electionId, CandidateStatus.Approved);
        return Ok(candidates);
    }

    /// <summary>
    /// Get pending candidate nominations for review (Admin Only)
    /// </summary>
    [HttpGet("pending")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    [ProducesResponseType(typeof(List<CandidateResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPending()
    {
        var pending = await _candidateService.GetPendingCandidatesAsync();
        return Ok(pending);
    }

    /// <summary>
    /// Student self-nomination for an election position
    /// </summary>
    [HttpPost("nominate")]
    [Authorize]
    [ProducesResponseType(typeof(CandidateResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Nominate([FromBody] NominateSelfDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var studentId = User.FindFirstValue("studentId");
        if (string.IsNullOrEmpty(studentId))
        {
            return Unauthorized(new { message = "Student ID not found in token." });
        }

        var (success, message, data) = await _candidateService.NominateSelfAsync(studentId, dto);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(data);
    }

    /// <summary>
    /// Direct candidate creation (Admin Only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    [ProducesResponseType(typeof(CandidateResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCandidateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message, data) = await _candidateService.AddCandidateAsync(dto, adminEmail, autoApprove: true);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = data!.Id }, data);
    }

    /// <summary>
    /// Approve or reject a candidate's nomination (Admin Only)
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] CandidateStatusUpdateDto dto)
    {
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message) = await _candidateService.UpdateCandidateStatusAsync(id, dto, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Get candidate by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CandidateResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var candidate = await _candidateService.GetCandidateByIdAsync(id);
        if (candidate == null)
        {
            return NotFound(new { message = "Candidate not found." });
        }
        return Ok(candidate);
    }

    /// <summary>
    /// Delete candidate (Admin Only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    public async Task<IActionResult> Delete(string id)
    {
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message) = await _candidateService.RemoveCandidateAsync(id, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }
}
