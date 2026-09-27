namespace Backend.Services;

public interface IHashService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
    string GenerateVoterToken(string studentId, string electionId, string electionSalt);
}
