using System.Security.Claims;
using System.Text;
using Backend.Common;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>
    /// Get aggregated metrics for the admin dashboard
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(AdminDashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var summary = await _adminService.GetDashboardSummaryAsync();
        return Ok(summary);
    }

    /// <summary>
    /// Get live results for a specific election
    /// </summary>
    [HttpGet("results/{electionId}")]
    [ProducesResponseType(typeof(LiveElectionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetElectionResults(string electionId)
    {
        var result = await _adminService.GetLiveElectionResultAsync(electionId);
        if (result == null)
        {
            return NotFound(new { message = "Election not found." });
        }
        return Ok(result);
    }

    /// <summary>
    /// Get all registered users for voter management
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(List<UserResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    /// <summary>
    /// Approve or suspend a user account
    /// </summary>
    [HttpPut("users/{userId}/approval")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetUserApproval(string userId, [FromBody] bool isApproved)
    {
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message) = await _adminService.ToggleUserApprovalAsync(userId, isApproved, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Change user role (SuperAdmin only)
    /// </summary>
    [HttpPut("users/{userId}/role")]
    [Authorize(Roles = UserRole.SuperAdmin)]
    public async Task<IActionResult> SetUserRole(string userId, [FromBody] string newRole)
    {
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "SuperAdmin";
        var (success, message) = await _adminService.UpdateUserRoleAsync(userId, newRole, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Download election results as CSV
    /// </summary>
    [HttpGet("reports/results/{electionId}/csv")]
    public async Task<IActionResult> DownloadResultsCsv(string electionId)
    {
        var csv = await _adminService.GenerateElectionResultsCsvAsync(electionId);
        if (string.IsNullOrEmpty(csv))
        {
            return NotFound(new { message = "Election data not found." });
        }

        var bytes = Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"Election_Results_{electionId}.csv");
    }

    /// <summary>
    /// Download voter turnout analytics as CSV
    /// </summary>
    [HttpGet("reports/turnout/{electionId}/csv")]
    public async Task<IActionResult> DownloadTurnoutCsv(string electionId)
    {
        var csv = await _adminService.GenerateVoterTurnoutCsvAsync(electionId);
        if (string.IsNullOrEmpty(csv))
        {
            return NotFound(new { message = "Election data not found." });
        }

        var bytes = Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"Voter_Turnout_{electionId}.csv");
    }
}
