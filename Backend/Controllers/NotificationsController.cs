using System.Security.Claims;
using Backend.Common;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// Get all in-system notifications for the logged-in user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var notifications = await _notificationService.GetNotificationsAsync(userId);
        return Ok(notifications);
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(string id)
    {
        await _notificationService.MarkAsReadAsync(id);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Mark all notifications as read for current user
    /// </summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Broadcast an announcement notification (Admin only)
    /// </summary>
    [HttpPost("broadcast")]
    [Authorize(Roles = $"{UserRole.Admin},{UserRole.SuperAdmin},{UserRole.ElectionAdmin}")]
    public async Task<IActionResult> Broadcast([FromBody] SendNotificationDto dto)
    {
        var result = await _notificationService.SendNotificationAsync(dto);
        return Ok(result);
    }
}
