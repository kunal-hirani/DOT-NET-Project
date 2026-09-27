using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class Notification
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("message")]
    public string Message { get; set; } = string.Empty;

    [BsonElement("type")]
    public string Type { get; set; } = "INFO"; // "ANNOUNCEMENT" | "VOTING_START" | "DEADLINE" | "APPROVAL" | "RESULTS"

    [BsonElement("targetUserId")]
    public string? TargetUserId { get; set; } // null = broadcast to all

    [BsonElement("electionId")]
    public string? ElectionId { get; set; }

    [BsonElement("isRead")]
    public bool IsRead { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
