using Backend.Models;

namespace Backend.Services;

public interface ITokenService
{
    string GenerateJwtToken(User user, out DateTime expiresAt);
}
