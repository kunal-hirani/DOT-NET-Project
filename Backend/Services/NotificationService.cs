using Backend.DTOs;
using Backend.Hubs;
using Backend.Models;
using Backend.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public interface INotificationService
{
    Task<List<NotificationDto>> GetNotificationsAsync(string userId);
    Task<NotificationDto> SendNotificationAsync(SendNotificationDto dto);
    Task MarkAsReadAsync(string notificationId);
    Task MarkAllAsReadAsync(string userId);
}

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IHubContext<ElectionHub> _hubContext;

    public NotificationService(
        INotificationRepository notificationRepository,
        IHubContext<ElectionHub> hubContext)
    {
        _notificationRepository = notificationRepository;
        _hubContext = hubContext;
    }

    public async Task<List<NotificationDto>> GetNotificationsAsync(string userId)
    {
        var notifications = await _notificationRepository.GetUserNotificationsAsync(userId);
        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id ?? string.Empty,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            ElectionId = n.ElectionId,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    public async Task<NotificationDto> SendNotificationAsync(SendNotificationDto dto)
    {
        var notification = new Notification
        {
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            TargetUserId = dto.TargetUserId,
            ElectionId = dto.ElectionId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.CreateAsync(notification);

        var resultDto = new NotificationDto
        {
            Id = notification.Id ?? string.Empty,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            ElectionId = notification.ElectionId,
            IsRead = false,
            CreatedAt = notification.CreatedAt
        };

        // Broadcast over SignalR to all active clients or user
        try
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", resultDto);
        }
        catch
        {
            // Ignore socket broadcast failures
        }

        return resultDto;
    }

    public async Task MarkAsReadAsync(string notificationId)
    {
        await _notificationRepository.MarkAsReadAsync(notificationId);
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId);
    }
}
