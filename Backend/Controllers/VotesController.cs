using System.Security.Claims;
using Backend.Common;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VotesController : ControllerBase
{
    private readonly IVotingService _votingService;

    public VotesController(IVotingService votingService)
    {
        _votingService = votingService;
    }

    /// <summary>
    /// Cast a vote in an active election (Student and Candidate voters)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = $"{UserRole.Student},{UserRole.Candidate}")]
    [ProducesResponseType(typeof(VoteResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CastVote([FromBody] CastVoteDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not identified." });
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

        var (success, message, data) = await _votingService.CastVoteAsync(userId, dto, ipAddress);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(data);
    }

    /// <summary>
    /// Check whether the logged-in student has already voted in this election
    /// </summary>
    [HttpGet("status/{electionId}")]
    [Authorize]
    [ProducesResponseType(typeof(VoteStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus(string electionId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not identified." });
        }

        var status = await _votingService.GetVoteStatusAsync(userId, electionId);
        return Ok(status);
    }
}
