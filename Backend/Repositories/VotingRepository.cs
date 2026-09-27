using Backend.Models;
using MongoDB.Driver;

namespace Backend.Repositories;

public interface IVotingRepository
{
    Task<bool> HasVotedAsync(string electionId, string position, string voterToken);
    Task<List<string>> GetVotedPositionsAsync(string electionId, string voterToken);
    Task<bool> RecordVoteAsync(string electionId, string position, string candidateId, string voterToken);
    Task<List<Vote>> GetVotesByElectionAsync(string electionId);
    Task<long> GetTotalVotesCountAsync(string? electionId = null);
}

public class VotingRepository : IVotingRepository
{
    private readonly IMongoCollection<VotingTransaction> _transactions;
    private readonly IMongoCollection<Vote> _votes;
    private readonly ICandidateRepository _candidateRepository;

    public VotingRepository(IMongoDatabase database, ICandidateRepository candidateRepository)
    {
        _transactions = database.GetCollection<VotingTransaction>("votingTransactions");
        _votes = database.GetCollection<Vote>("votes");
        _candidateRepository = candidateRepository;
    }

    public async Task<bool> HasVotedAsync(string electionId, string position, string voterToken)
    {
        var count = await _transactions.CountDocumentsAsync(t => 
            t.ElectionId == electionId && 
            t.Position == position && 
            t.VoterToken == voterToken);
        return count > 0;
    }

    public async Task<List<string>> GetVotedPositionsAsync(string electionId, string voterToken)
    {
        var txs = await _transactions.Find(t => t.ElectionId == electionId && t.VoterToken == voterToken).ToListAsync();
        return txs.Select(t => t.Position).Distinct().ToList();
    }

    public async Task<bool> RecordVoteAsync(string electionId, string position, string candidateId, string voterToken)
    {
        var transaction = new VotingTransaction
        {
            ElectionId = electionId,
            Position = position,
            VoterToken = voterToken,
            Timestamp = DateTime.UtcNow
        };

        try
        {
            await _transactions.InsertOneAsync(transaction);
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            return false;
        }

        var vote = new Vote
        {
            ElectionId = electionId,
            Position = position,
            CandidateId = candidateId,
            Timestamp = DateTime.UtcNow
        };
        await _votes.InsertOneAsync(vote);

        await _candidateRepository.IncrementVoteCountAsync(candidateId);

        return true;
    }

    public async Task<List<Vote>> GetVotesByElectionAsync(string electionId)
    {
        return await _votes.Find(v => v.ElectionId == electionId).ToListAsync();
    }

    public async Task<long> GetTotalVotesCountAsync(string? electionId = null)
    {
        if (string.IsNullOrEmpty(electionId))
        {
            return await _votes.CountDocumentsAsync(_ => true);
        }
        return await _votes.CountDocumentsAsync(v => v.ElectionId == electionId);
    }
}
