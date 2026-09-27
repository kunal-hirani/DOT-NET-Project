using Backend.Models;
using MongoDB.Driver;

namespace Backend.Repositories;

public class AuditRepository : IAuditRepository
{
    private readonly IMongoCollection<AuditLog> _logs;

    public AuditRepository(IMongoDatabase database)
    {
        _logs = database.GetCollection<AuditLog>("auditLogs");
    }

    public async Task LogAsync(string action, string performedBy, string details, string ipAddress = "")
    {
        var log = new AuditLog
        {
            Action = action,
            PerformedBy = performedBy,
            Details = details,
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow
        };
        await _logs.InsertOneAsync(log);
    }

    public async Task<List<AuditLog>> GetRecentLogsAsync(int limit = 50)
    {
        return await _logs.Find(_ => true)
                          .SortByDescending(l => l.Timestamp)
                          .Limit(limit)
                          .ToListAsync();
    }
}
