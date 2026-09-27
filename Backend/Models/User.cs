using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [BsonElement("enrollmentNo")]
    public string EnrollmentNo { get; set; } = string.Empty;

    [BsonElement("fullName")]
    public string FullName { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("department")]
    public string Department { get; set; } = string.Empty;

    [BsonElement("semester")]
    public int Semester { get; set; } = 1;

    [BsonElement("classDivision")]
    public string ClassDivision { get; set; } = "A";

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [BsonElement("role")]
    public string Role { get; set; } = Common.UserRole.Student;

    [BsonElement("isApproved")]
    public bool IsApproved { get; set; } = true;

    [BsonElement("isOtpVerified")]
    public bool IsOtpVerified { get; set; } = true;

    [BsonElement("failedLoginAttempts")]
    public int FailedLoginAttempts { get; set; } = 0;

    [BsonElement("lockoutUntil")]
    public DateTime? LockoutUntil { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
