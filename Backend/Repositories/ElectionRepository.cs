using Backend.Common;
using Backend.Models;
using MongoDB.Driver;

namespace Backend.Repositories;

public class ElectionRepository : IElectionRepository
{
    private readonly IMongoCollection<Election> _elections;

    public ElectionRepository(IMongoDatabase database)
    {
        _elections = database.GetCollection<Election>("elections");
    }

    public async Task<Election?> GetByIdAsync(string id)
    {
        return await _elections.Find(e => e.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Election>> GetAllAsync()
    {
        return await _elections.Find(_ => true)
                               .SortByDescending(e => e.CreatedAt)
                               .ToListAsync();
    }

    public async Task<List<Election>> GetActiveElectionsAsync()
    {
        var now = DateTime.UtcNow;
        return await _elections.Find(e => e.Status == ElectionStatus.Active && e.StartDate <= now && e.EndDate >= now)
                               .ToListAsync();
    }

    public async Task CreateAsync(Election election)
    {
        await _elections.InsertOneAsync(election);
    }

    public async Task UpdateAsync(Election election)
    {
        await _elections.ReplaceOneAsync(e => e.Id == election.Id, election);
    }

    public async Task DeleteAsync(string id)
    {
        await _elections.DeleteOneAsync(e => e.Id == id);
    }

    public async Task<long> GetTotalCountAsync()
    {
        return await _elections.CountDocumentsAsync(_ => true);
    }

    public async Task<long> GetCountByStatusAsync(string status)
    {
        return await _elections.CountDocumentsAsync(e => e.Status == status);
    }
}
