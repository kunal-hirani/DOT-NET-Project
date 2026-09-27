using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs;

public class ElectionHub : Hub
{
    private readonly ILogger<ElectionHub> _logger;

    public ElectionHub(ILogger<ElectionHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Client subscribes to live updates for a specific election
    /// </summary>
    public async Task JoinElectionGroup(string electionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"election-{electionId}");
        _logger.LogInformation("Client {ConnectionId} joined election group: election-{ElectionId}", Context.ConnectionId, electionId);
    }

    /// <summary>
    /// Client leaves election live update room
    /// </summary>
    public async Task LeaveElectionGroup(string electionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"election-{electionId}");
        _logger.LogInformation("Client {ConnectionId} left election group: election-{ElectionId}", Context.ConnectionId, electionId);
    }

    /// <summary>
    /// Admin dashboard subscribes to all global system updates
    /// </summary>
    public async Task JoinAdminDashboard()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "admin-dashboard");
        _logger.LogInformation("Client {ConnectionId} joined admin-dashboard group", Context.ConnectionId);
    }
}
