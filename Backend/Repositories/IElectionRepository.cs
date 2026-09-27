using Backend.Models;

namespace Backend.Repositories;

public interface IElectionRepository
{
    Task<Election?> GetByIdAsync(string id);
    Task<List<Election>> GetAllAsync();
    Task<List<Election>> GetActiveElectionsAsync();
    Task CreateAsync(Election election);
    Task UpdateAsync(Election election);
    Task DeleteAsync(string id);
    Task<long> GetTotalCountAsync();
    Task<long> GetCountByStatusAsync(string status);
}
