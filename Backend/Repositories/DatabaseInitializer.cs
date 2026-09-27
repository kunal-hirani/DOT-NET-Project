using Backend.Common;
using Backend.Models;
using MongoDB.Driver;

namespace Backend.Repositories;

public class DatabaseInitializer
{
    private readonly IMongoDatabase _database;
    private readonly ILogger<DatabaseInitializer> _logger;

    public DatabaseInitializer(IMongoDatabase database, ILogger<DatabaseInitializer> logger)
    {
        _database = database;
        _logger = logger;
    }

    public async Task InitializeAsync()
    {
        try
        {
            _logger.LogInformation("Initializing MongoDB indexes and seed data...");

            // 1. Users Collection Indexes (Unique Email & Unique StudentId)
            var usersCollection = _database.GetCollection<User>("users");
            var emailIndexModel = new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true, Name = "idx_users_email_unique" }
            );
            var studentIdIndexModel = new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.StudentId),
                new CreateIndexOptions { Unique = true, Name = "idx_users_studentId_unique" }
            );
            await usersCollection.Indexes.CreateManyAsync(new[] { emailIndexModel, studentIdIndexModel });

            // 2. VotingTransactions Collection Index (Compound Unique: ElectionId + Position + VoterToken)
            var transactionsCollection = _database.GetCollection<VotingTransaction>("votingTransactions");
            var txCompoundIndex = new CreateIndexModel<VotingTransaction>(
                Builders<VotingTransaction>.IndexKeys
                    .Ascending(t => t.ElectionId)
                    .Ascending(t => t.Position)
                    .Ascending(t => t.VoterToken),
                new CreateIndexOptions { Unique = true, Name = "idx_tx_election_position_voter_unique" }
            );
            await transactionsCollection.Indexes.CreateOneAsync(txCompoundIndex);

            // 3. Candidates Collection Index (Compound Unique: ElectionId + StudentId)
            var candidatesCollection = _database.GetCollection<Candidate>("candidates");
            var candidateCompoundIndex = new CreateIndexModel<Candidate>(
                Builders<Candidate>.IndexKeys
                    .Ascending(c => c.ElectionId)
                    .Ascending(c => c.StudentId),
                new CreateIndexOptions { Unique = true, Name = "idx_candidates_election_student_unique" }
            );
            await candidatesCollection.Indexes.CreateOneAsync(candidateCompoundIndex);

            // 4. Seed Default Super Admin Account if none exists
            var existingAdmin = await usersCollection.Find(u => u.Role == UserRole.Admin || u.Role == UserRole.SuperAdmin || u.Email == "admin@college.edu").FirstOrDefaultAsync();
            if (existingAdmin == null)
            {
                var adminUser = new User
                {
                    StudentId = "ADMIN-001",
                    EnrollmentNo = "ENR-ADMIN-001",
                    FullName = "College Election Administrator",
                    Email = "admin@college.edu",
                    Department = "Administration",
                    Semester = 0,
                    ClassDivision = "A",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.SuperAdmin,
                    IsApproved = true,
                    IsOtpVerified = true,
                    CreatedAt = DateTime.UtcNow
                };
                await usersCollection.InsertOneAsync(adminUser);
                _logger.LogInformation("Default Super Admin account seeded: admin@college.edu (Password: Admin@123)");
            }

            // 5. Seed Default Candidate Account if none exists
            var existingCandidate = await usersCollection.Find(u => u.Email == "candidate@college.edu" || u.StudentId == "CAND-2026-001").FirstOrDefaultAsync();
            if (existingCandidate == null)
            {
                var candidateUser = new User
                {
                    StudentId = "CAND-2026-001",
                    EnrollmentNo = "92100103099",
                    FullName = "Aarav Patel",
                    Email = "candidate@college.edu",
                    Department = "Computer Science",
                    Semester = 6,
                    ClassDivision = "A",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                    Role = UserRole.Candidate,
                    IsApproved = true,
                    IsOtpVerified = true,
                    CreatedAt = DateTime.UtcNow
                };
                await usersCollection.InsertOneAsync(candidateUser);
                _logger.LogInformation("Default Candidate account seeded: candidate@college.edu / CAND-2026-001 (Password: Password123)");
            }

            // 6. Seed Default Student Account if none exists
            var existingStudent = await usersCollection.Find(u => u.Email == "student@college.edu" || u.StudentId == "STU-2026-001").FirstOrDefaultAsync();
            if (existingStudent == null)
            {
                var studentUser = new User
                {
                    StudentId = "STU-2026-001",
                    EnrollmentNo = "92100103001",
                    FullName = "Priya Sharma",
                    Email = "student@college.edu",
                    Department = "Computer Science",
                    Semester = 4,
                    ClassDivision = "B",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"),
                    Role = UserRole.Student,
                    IsApproved = true,
                    IsOtpVerified = true,
                    CreatedAt = DateTime.UtcNow
                };
                await usersCollection.InsertOneAsync(studentUser);
                _logger.LogInformation("Default Student account seeded: student@college.edu / STU-2026-001 (Password: Password123)");
            }

            // 7. Seed Initial Approved Candidates for Live/Active Elections if not already added
            var electionsCollection = _database.GetCollection<Election>("elections");
            var activeElection = await electionsCollection.Find(e => e.Status == ElectionStatus.Live || e.Status == ElectionStatus.Active).FirstOrDefaultAsync();
            if (activeElection == null)
            {
                activeElection = await electionsCollection.Find(FilterDefinition<Election>.Empty).FirstOrDefaultAsync();
            }

            if (activeElection != null && !string.IsNullOrEmpty(activeElection.Id))
            {
                var sampleCandidates = new List<Candidate>
                {
                    new()
                    {
                        ElectionId = activeElection.Id,
                        StudentId = "CAND-2026-001",
                        FullName = "Aarav Patel",
                        Department = "Computer Science",
                        Semester = 6,
                        ClassDivision = "A",
                        Position = "President",
                        Manifesto = "Empowering students through transparent governance, enhanced tech labs, and 24x7 library facilities.",
                        SymbolUrl = "🌟",
                        PhotoUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=AaravPatel",
                        Status = CandidateStatus.Approved,
                        ApprovalNotes = "Verified by Election Committee",
                        VoteCount = 0,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        ElectionId = activeElection.Id,
                        StudentId = "CAND-2026-002",
                        FullName = "Ananya Desai",
                        Department = "Information Technology",
                        Semester = 6,
                        ClassDivision = "B",
                        Position = "President",
                        Manifesto = "Bridging the gap between students and university leadership through active grievance redressal.",
                        SymbolUrl = "🚀",
                        PhotoUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaDesai",
                        Status = CandidateStatus.Approved,
                        ApprovalNotes = "Verified by Election Committee",
                        VoteCount = 0,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        ElectionId = activeElection.Id,
                        StudentId = "CAND-2026-003",
                        FullName = "Devansh Mehta",
                        Department = "Computer Science",
                        Semester = 4,
                        ClassDivision = "A",
                        Position = "Vice President",
                        Manifesto = "Fostering inter-departmental collaboration, national hackathons, and sports infrastructure.",
                        SymbolUrl = "🦁",
                        PhotoUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=DevanshMehta",
                        Status = CandidateStatus.Approved,
                        ApprovalNotes = "Verified by Election Committee",
                        VoteCount = 0,
                        CreatedAt = DateTime.UtcNow
                    },
                    new()
                    {
                        ElectionId = activeElection.Id,
                        StudentId = "CAND-2026-004",
                        FullName = "Sneha Joshi",
                        Department = "Business Administration",
                        Semester = 4,
                        ClassDivision = "C",
                        Position = "Vice President",
                        Manifesto = "Campus sustainability, green energy projects, and diverse student welfare clubs.",
                        SymbolUrl = "⚡",
                        PhotoUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaJoshi",
                        Status = CandidateStatus.Approved,
                        ApprovalNotes = "Verified by Election Committee",
                        VoteCount = 0,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                foreach (var cand in sampleCandidates)
                {
                    var exists = await candidatesCollection.Find(c => c.ElectionId == cand.ElectionId && c.StudentId == cand.StudentId).AnyAsync();
                    if (!exists)
                    {
                        await candidatesCollection.InsertOneAsync(cand);
                    }
                }
                _logger.LogInformation("Verified candidates verified and seeded for election: {Title}", activeElection.Title);
            }

            _logger.LogInformation("MongoDB indexes & seed data initialized successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during MongoDB initialization.");
        }
    }
}
