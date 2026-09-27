using Backend.Models;

namespace Backend.Repositories;

public interface IAuditRepository
{
    Task LogAsync(string action, string performedBy, string details, string ipAddress = "");
    Task<List<AuditLog>> GetRecentLogsAsync(int limit = 50);
}
