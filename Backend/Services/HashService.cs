using System.Security.Cryptography;
using System.Text;

namespace Backend.Services;

public class HashService : IHashService
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Generates a deterministic HMAC-SHA256 token representing the voter's permission to vote
    /// in this specific election. This hides the student's plain ID from the ballot record.
    /// </summary>
    public string GenerateVoterToken(string studentId, string electionId, string electionSalt)
    {
        var secretKeyBytes = Encoding.UTF8.GetBytes(electionSalt);
        var messageBytes = Encoding.UTF8.GetBytes($"{studentId.Trim().ToUpperInvariant()}:{electionId}");

        using var hmac = new HMACSHA256(secretKeyBytes);
        var hashBytes = hmac.ComputeHash(messageBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
