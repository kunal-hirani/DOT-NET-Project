import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Clock, XCircle, FileText, Vote, BarChart3, AlertCircle, PlusCircle, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { signalRService } from '../services/signalrService';
import NominateCandidateModal from '../components/NominateCandidateModal';

export default function CandidatePortal({ user, onSwitchToVoting }) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nominateElection, setNominateElection] = useState(null);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data);
    } catch (err) {
      console.error('Failed to load elections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();

    // SignalR Real-Time Listener
    const handleVoteUpdate = (update) => {
      fetchElections();
    };

    signalRService.on('ReceiveVoteCast', handleVoteUpdate);
    signalRService.on('ReceiveElectionUpdate', handleVoteUpdate);

    return () => {
      signalRService.off('ReceiveVoteCast', handleVoteUpdate);
      signalRService.off('ReceiveElectionUpdate', handleVoteUpdate);
    };
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading candidate campaign portal...</div>;
  }

  // Find all candidacy nominations for current student
  const candidacies = [];
  const currentUserIdUpper = (user?.studentId || '').toUpperCase();
  const currentUserNameLower = (user?.fullName || '').toLowerCase();

  elections.forEach((el) => {
    el.candidates?.forEach((cand) => {
      const isCandMatch =
        (cand.studentId && cand.studentId.toUpperCase() === currentUserIdUpper) ||
        (cand.fullName && cand.fullName.toLowerCase() === currentUserNameLower);

      if (isCandMatch) {
        // Compute total votes for this candidate's contested position
        const posCandidates = el.candidates.filter((c) => c.position === cand.position);
        const totalPosVotes = posCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
        const percentage = totalPosVotes > 0 ? ((cand.voteCount / totalPosVotes) * 100).toFixed(1) : 0;

        candidacies.push({
          ...cand,
          electionId: el.id,
          electionTitle: el.title,
          electionStatus: el.status,
          totalContestVotes: totalPosVotes,
          computedPercentage: percentage
        });
      }
    });
  });

  const activeElection = elections.find((e) => e.status === 'Active' || e.status === 'Live') || elections[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px 30px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: '1.8rem' }}>🎖️</span>
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Candidate Campaign Portal</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Nominee: <strong style={{ color: '#fff' }}>{user.fullName}</strong> ({user.studentId}) &nbsp;|&nbsp; Department: <strong style={{ color: '#fff' }}>{user.department}</strong> (Sem {user.semester})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {activeElection && (
            <button
              className="btn btn-secondary"
              onClick={() => setNominateElection(activeElection)}
              style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: 'var(--radius-pill)' }}
            >
              <PlusCircle size={15} /> Apply for Position
            </button>
          )}

          {onSwitchToVoting && (
            <button
              className="btn btn-primary"
              onClick={onSwitchToVoting}
              style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: 'var(--radius-pill)' }}
            >
              <Vote size={15} /> Open Voter Ballot
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={fetchElections}
            title="Refresh campaign stats"
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-pill)' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Your Contested Positions & Live Standings</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Real-time candidate tally directly connected to university SignalR voting engine.
        </p>
      </div>

      {candidacies.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <AlertCircle size={44} color="#f59e0b" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontSize: '1.3rem' }}>No Active Candidacies Linked</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '8px auto 20px' }}>
            You haven't applied for any election post yet, or your nomination is pending committee approval.
          </p>
          {activeElection && (
            <button
              className="btn btn-primary"
              onClick={() => setNominateElection(activeElection)}
              style={{ borderRadius: 'var(--radius-pill)', padding: '10px 22px' }}
            >
              <PlusCircle size={16} /> Self-Nominate for {activeElection.title}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 22 }}>
          {candidacies.map((c) => (
            <div key={c.id} className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header: Status & Election badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge ${c.status === 'Approved' ? 'badge-active' : c.status === 'Pending' ? 'badge-draft' : 'badge-paused'}`}>
                  {c.status === 'Approved' && <CheckCircle2 size={13} />}
                  {c.status === 'Pending' && <Clock size={13} />}
                  {c.status === 'Rejected' && <XCircle size={13} />}
                  {c.status} Candidate
                </span>
                <span className="badge badge-upcoming" style={{ fontSize: '0.72rem' }}>
                  {c.electionStatus} Election
                </span>
              </div>

              {/* Title & Election */}
              <div>
                <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 2 }}>{c.position}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.electionTitle}</p>
              </div>

              {/* Live Tally Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '2.4rem' }}>{c.symbolUrl || '🌟'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Live Vote Tally
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {c.voteCount || 0} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>votes ({c.computedPercentage || c.votePercentage || 0}%)</span>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${c.computedPercentage || c.votePercentage || 0}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>

              {/* Manifesto */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
                  Campaign Manifesto
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}>
                  "{c.manifesto || 'Committed to empowering students and fostering institutional growth.'}"
                </p>
              </div>

              {/* Committee notes */}
              {c.approvalNotes && (
                <div style={{ fontSize: '0.8rem', color: '#fbbf24', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Committee Feedback:</strong> {c.approvalNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nomination Modal */}
      {nominateElection && (
        <NominateCandidateModal
          election={nominateElection}
          user={user}
          onClose={() => setNominateElection(null)}
          onSuccess={() => {
            setNominateElection(null);
            fetchElections();
          }}
        />
      )}
    </div>
  );
}

