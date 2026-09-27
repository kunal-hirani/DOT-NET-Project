using System.Security.Claims;
using Backend.Common;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ElectionsController : ControllerBase
{
    private readonly IElectionService _electionService;

    public ElectionsController(IElectionService electionService)
    {
        _electionService = electionService;
    }

    /// <summary>
    /// Get all elections (shows personalized voting status if authenticated)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ElectionResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);
        var elections = await _electionService.GetAllElectionsAsync(currentUserId, role);
        return Ok(elections);
    }

    /// <summary>
    /// Get only active / live elections
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<ElectionResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActive()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var elections = await _electionService.GetActiveElectionsAsync(currentUserId);
        return Ok(elections);
    }

    /// <summary>
    /// Get election by ID with candidates and position standings
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ElectionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var election = await _electionService.GetElectionByIdAsync(id, currentUserId);
        if (election == null)
        {
            return NotFound(new { message = "Election not found." });
        }
        return Ok(election);
    }

    /// <summary>
    /// Create an election (Admin Only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    [ProducesResponseType(typeof(ElectionResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateElectionDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message, data) = await _electionService.CreateElectionAsync(dto, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetById), new { id = data!.Id }, data);
    }

    /// <summary>
    /// Update election details (Admin Only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    [ProducesResponseType(typeof(ElectionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateElectionDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message, data) = await _electionService.UpdateElectionAsync(id, dto, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(data);
    }

    /// <summary>
    /// Update election status (Upcoming, Live, Paused, Completed, Cancelled) (Admin Only)
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] string newStatus)
    {
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message) = await _electionService.UpdateElectionStatusAsync(id, newStatus, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }

    /// <summary>
    /// Delete an election (Admin Only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(string id)
    {
        var adminEmail = User.FindFirstValue(ClaimTypes.Email) ?? "Admin";
        var (success, message) = await _electionService.DeleteElectionAsync(id, adminEmail);
        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message });
    }
}
