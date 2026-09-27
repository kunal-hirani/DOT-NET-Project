using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class Candidate
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("electionId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ElectionId { get; set; } = string.Empty;

    [BsonElement("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [BsonElement("fullName")]
    public string FullName { get; set; } = string.Empty;

    [BsonElement("position")]
    public string Position { get; set; } = "President";

    [BsonElement("department")]
    public string Department { get; set; } = string.Empty;

    [BsonElement("semester")]
    public int Semester { get; set; } = 1;

    [BsonElement("classDivision")]
    public string ClassDivision { get; set; } = "A";

    [BsonElement("manifesto")]
    public string Manifesto { get; set; } = string.Empty;

    [BsonElement("photoUrl")]
    public string PhotoUrl { get; set; } = string.Empty;

    [BsonElement("symbolUrl")]
    public string SymbolUrl { get; set; } = string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = Common.CandidateStatus.Approved; // "Pending" | "Approved" | "Rejected"

    [BsonElement("approvalNotes")]
    public string ApprovalNotes { get; set; } = string.Empty;

    [BsonElement("voteCount")]
    public int VoteCount { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
