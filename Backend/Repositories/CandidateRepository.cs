using Backend.Common;
using Backend.Models;
using MongoDB.Driver;

namespace Backend.Repositories;

public interface ICandidateRepository
{
    Task<Candidate?> GetByIdAsync(string id);
    Task<List<Candidate>> GetByElectionIdAsync(string electionId, string? status = null);
    Task<List<Candidate>> GetPendingCandidatesAsync();
    Task<Candidate?> GetByElectionAndStudentIdAsync(string electionId, string studentId);
    Task<List<Candidate>> GetByStudentIdAsync(string studentId);
    Task CreateAsync(Candidate candidate);
    Task UpdateAsync(Candidate candidate);
    Task UpdateStatusAsync(string id, string status, string notes);
    Task DeleteAsync(string id);
    Task<bool> IncrementVoteCountAsync(string candidateId);
    Task<long> GetTotalCountAsync();
    Task<long> GetPendingCountAsync();
}

public class CandidateRepository : ICandidateRepository
{
    private readonly IMongoCollection<Candidate> _candidates;

    public CandidateRepository(IMongoDatabase database)
    {
        _candidates = database.GetCollection<Candidate>("candidates");
    }

    public async Task<Candidate?> GetByIdAsync(string id)
    {
        return await _candidates.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Candidate>> GetByElectionIdAsync(string electionId, string? status = null)
    {
        if (string.IsNullOrEmpty(status))
        {
            return await _candidates.Find(c => c.ElectionId == electionId).ToListAsync();
        }
        return await _candidates.Find(c => c.ElectionId == electionId && c.Status == status).ToListAsync();
    }

    public async Task<List<Candidate>> GetPendingCandidatesAsync()
    {
        return await _candidates.Find(c => c.Status == CandidateStatus.Pending)
                                .SortByDescending(c => c.CreatedAt)
                                .ToListAsync();
    }

    public async Task<Candidate?> GetByElectionAndStudentIdAsync(string electionId, string studentId)
    {
        return await _candidates.Find(c => c.ElectionId == electionId && c.StudentId.ToLower() == studentId.ToLower())
                                .FirstOrDefaultAsync();
    }

    public async Task<List<Candidate>> GetByStudentIdAsync(string studentId)
    {
        return await _candidates.Find(c => c.StudentId.ToLower() == studentId.ToLower()).ToListAsync();
    }

    public async Task CreateAsync(Candidate candidate)
    {
        await _candidates.InsertOneAsync(candidate);
    }

    public async Task UpdateAsync(Candidate candidate)
    {
        await _candidates.ReplaceOneAsync(c => c.Id == candidate.Id, candidate);
    }

    public async Task UpdateStatusAsync(string id, string status, string notes)
    {
        var update = Builders<Candidate>.Update
            .Set(c => c.Status, status)
            .Set(c => c.ApprovalNotes, notes);
        await _candidates.UpdateOneAsync(c => c.Id == id, update);
    }

    public async Task DeleteAsync(string id)
    {
        await _candidates.DeleteOneAsync(c => c.Id == id);
    }

    public async Task<bool> IncrementVoteCountAsync(string candidateId)
    {
        var filter = Builders<Candidate>.Filter.Eq(c => c.Id, candidateId);
        var update = Builders<Candidate>.Update.Inc(c => c.VoteCount, 1);
        var result = await _candidates.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<long> GetTotalCountAsync()
    {
        return await _candidates.CountDocumentsAsync(_ => true);
    }

    public async Task<long> GetPendingCountAsync()
    {
        return await _candidates.CountDocumentsAsync(c => c.Status == CandidateStatus.Pending);
    }
}
