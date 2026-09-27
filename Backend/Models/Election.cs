using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class Election
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("department")]
    public string Department { get; set; } = "All";

    [BsonElement("eligibleDepartments")]
    public List<string> EligibleDepartments { get; set; } = new() { "All" };

    [BsonElement("eligibleSemesters")]
    public List<int> EligibleSemesters { get; set; } = new() { 1, 2, 3, 4, 5, 6, 7, 8 };

    [BsonElement("positions")]
    public List<string> Positions { get; set; } = new() { "President", "Vice President", "General Secretary", "Sports Secretary", "Cultural Secretary" };

    [BsonElement("rules")]
    public string Rules { get; set; } = "1. Only registered and approved students are eligible to vote.\n2. One vote per position per student.\n3. Votes once cast cannot be altered or retracted.\n4. Strict anonymity is cryptographically guaranteed.";

    [BsonElement("startDate")]
    public DateTime StartDate { get; set; }

    [BsonElement("endDate")]
    public DateTime EndDate { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = Common.ElectionStatus.Draft; // "Upcoming" | "Live" | "Paused" | "Completed" | "Cancelled" | "Draft"

    [BsonElement("electionSalt")]
    public string ElectionSalt { get; set; } = Guid.NewGuid().ToString("N");

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
