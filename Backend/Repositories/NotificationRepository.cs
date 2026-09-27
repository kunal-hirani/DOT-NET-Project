using Backend.Models;
using MongoDB.Driver;

namespace Backend.Repositories;

public interface INotificationRepository
{
    Task<List<Notification>> GetUserNotificationsAsync(string userId, int limit = 30);
    Task CreateAsync(Notification notification);
    Task MarkAsReadAsync(string notificationId);
    Task MarkAllAsReadAsync(string userId);
}

public class NotificationRepository : INotificationRepository
{
    private readonly IMongoCollection<Notification> _notifications;

    public NotificationRepository(IMongoDatabase database)
    {
        _notifications = database.GetCollection<Notification>("notifications");
    }

    public async Task<List<Notification>> GetUserNotificationsAsync(string userId, int limit = 30)
    {
        var filter = Builders<Notification>.Filter.Or(
            Builders<Notification>.Filter.Eq(n => n.TargetUserId, userId),
            Builders<Notification>.Filter.Eq(n => n.TargetUserId, null)
        );

        return await _notifications.Find(filter)
                                   .SortByDescending(n => n.CreatedAt)
                                   .Limit(limit)
                                   .ToListAsync();
    }

    public async Task CreateAsync(Notification notification)
    {
        await _notifications.InsertOneAsync(notification);
    }

    public async Task MarkAsReadAsync(string notificationId)
    {
        var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
        await _notifications.UpdateOneAsync(n => n.Id == notificationId, update);
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        var filter = Builders<Notification>.Filter.Or(
            Builders<Notification>.Filter.Eq(n => n.TargetUserId, userId),
            Builders<Notification>.Filter.Eq(n => n.TargetUserId, null)
        );
        var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
        await _notifications.UpdateManyAsync(filter, update);
    }
}
