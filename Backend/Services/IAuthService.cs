using Backend.DTOs;

namespace Backend.Services;

public interface IAuthService
{
    Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterAsync(RegisterRequestDto request);
    Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginRequestDto request);
    Task<UserResponseDto?> GetUserProfileAsync(string userId);
}
