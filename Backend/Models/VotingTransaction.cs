using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class VotingTransaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("electionId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ElectionId { get; set; } = string.Empty;

    [BsonElement("position")]
    public string Position { get; set; } = "General";

    [BsonElement("voterToken")]
    public string VoterToken { get; set; } = string.Empty;

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
