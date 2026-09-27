import React, { useEffect, useState } from 'react';
import { 
  Vote, CheckCircle2, Clock, Calendar, UserCheck, 
  FileText, Search, Filter, Trophy, PlusCircle, AlertCircle,
  ChevronRight, Shield, Award, Check, Sparkles, School,
  Lock, ArrowRight, CheckCircle, HelpCircle, Download
} from 'lucide-react';
import api from '../services/api';
import { signalRService } from '../services/signalrService';
import VoteModal from '../components/VoteModal';
import RulesModal from '../components/RulesModal';
import NominateCandidateModal from '../components/NominateCandidateModal';
import CountdownTimer from '../components/CountdownTimer';

export default function StudentDashboard({ user }) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [activeRulesElection, setActiveRulesElection] = useState(null);
  const [nominateElection, setNominateElection] = useState(null);
  const [votingSelection, setVotingSelection] = useState(null);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data);
      if (res.data.length > 0 && !selectedElectionId) {
        const active = res.data.find((e) => e.status === 'Active' || e.status === 'Live') || res.data[0];
        setSelectedElectionId(active.id);
        const positions = active.positions?.length > 0 ? active.positions : ['President'];
        setSelectedPosition(positions[0]);
      }
    } catch (err) {
      console.error('Failed to load elections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();

    signalRService.onVoteUpdate((updatedResult) => {
      setElections((prev) =>
        prev.map((e) => {
          if (e.id === updatedResult.electionId) {
            return {
              ...e,
              candidates: updatedResult.candidates
            };
          }
          return e;
        })
      );
    });
  }, []);

  const currentElection = elections.find((e) => e.id === selectedElectionId) || elections[0];
  const positions = currentElection?.positions?.length > 0 ? currentElection.positions : ['President', 'Vice President', 'General Secretary', 'Sports Secretary'];
  const votedPositions = currentElection?.votedPositions || [];

  const handleVoteSuccess = (electionId, position) => {
    setElections((prev) =>
      prev.map((e) => {
        if (e.id === electionId) {
          const updatedVoted = [...(e.votedPositions || []), position];
          const hasVotedAll = e.positions?.every((pos) => updatedVoted.includes(pos));
          return {
            ...e,
            votedPositions: updatedVoted,
            hasCurrentUserVoted: hasVotedAll
          };
        }
        return e;
      })
    );
    setSelectedCandidate(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '90px 0', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: 14, height: 14, margin: '0 auto 16px' }} />
        <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Loading Marwadi University Voting Booth...</p>
      </div>
    );
  }

  const isLive = currentElection?.status === 'Live' || currentElection?.status === 'Active';
  const isCompleted = currentElection?.status === 'Completed';
  const hasVotedCurrentPos = votedPositions.includes(selectedPosition);
  const completionPercentage = positions.length > 0 ? Math.round((votedPositions.length / positions.length) * 100) : 0;

  // Candidates for selected post
  const candidatesForPosition = currentElection?.candidates?.filter(
    (c) => c.position === selectedPosition && 
    (c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', paddingBottom: 40 }}>
      {/* 1. Official Voter Identity Card & Progress Ribbon */}
      <div className="voter-identity-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 54, 
              height: 54, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #2563eb, #00a896)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#fff', 
              fontWeight: 800, 
              fontSize: '1.25rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}>
              {user.fullName ? user.fullName.charAt(0) : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{user.fullName}</h2>
                <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                  <UserCheck size={12} /> Verified Voter
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 3, margin: 0 }}>
                Enrollment ID: <strong style={{ color: '#e2e8f0' }}>{user.enrollmentNo || user.studentId}</strong> &nbsp;•&nbsp; 
                Faculty: <strong style={{ color: '#38bdf8' }}>{user.department}</strong> (Sem {user.semester || 'VI'})
              </p>
            </div>
          </div>

          {/* Rules & Help Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setActiveRulesElection(currentElection)}
            >
              <FileText size={15} /> Voting Rules & Guidelines
            </button>
            {!isCompleted && (
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '0.82rem', padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                onClick={() => setNominateElection(currentElection)}
              >
                <PlusCircle size={15} /> Self-Nominate
              </button>
            )}
          </div>
        </div>

        {/* Voting Progress Tracker */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
              Ballot Completion Progress: <strong style={{ color: completionPercentage === 100 ? '#10b981' : '#38bdf8' }}>{votedPositions.length} of {positions.length} Positions Voted ({completionPercentage}%)</strong>
            </span>
            <span style={{ color: completionPercentage === 100 ? '#10b981' : 'var(--text-subtle)', fontWeight: 700 }}>
              {completionPercentage === 100 ? '✓ Complete Official Ballot Submitted' : 'Cast votes in all categories below'}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Election Selector & Countdown Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
            Active University Election
          </span>
          <select 
            className="form-select" 
            style={{ marginTop: 6, fontWeight: 700, fontSize: '0.98rem', padding: '10px 14px' }}
            value={selectedElectionId}
            onChange={(e) => {
              setSelectedElectionId(e.target.value);
              const el = elections.find((x) => x.id === e.target.value);
              if (el?.positions?.length > 0) setSelectedPosition(el.positions[0]);
            }}
          >
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {isLive && (
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <CountdownTimer targetDate={currentElection.endDate} label="Voting Booth Closes in" onExpire={fetchElections} />
          </div>
        )}
      </div>

      {/* 3. Position Stepper Navigation Chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
            Select Position Ballot Sheet
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click a position tab below to view candidates
          </span>
        </div>

        <div className="pos-filter-bar" style={{ marginBottom: 0 }}>
          {positions.map((pos, idx) => {
            const hasVoted = votedPositions.includes(pos);
            const isSelected = selectedPosition === pos;

            return (
              <button
                key={pos}
                className={`pos-chip ${isSelected ? 'active' : ''}`}
                style={{
                  background: isSelected 
                    ? '#2563eb' 
                    : hasVoted 
                      ? 'rgba(16, 185, 129, 0.12)' 
                      : 'rgba(14, 20, 36, 0.7)',
                  borderColor: isSelected 
                    ? '#3b82f6' 
                    : hasVoted 
                      ? 'rgba(16, 185, 129, 0.35)' 
                      : 'var(--border-subtle)'
                }}
                onClick={() => {
                  setSelectedPosition(pos);
                  setSelectedCandidate(null);
                }}
              >
                {hasVoted ? (
                  <CheckCircle2 size={16} color="#10b981" />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? '#fff' : 'var(--accent-blue)' }}>
                    0{idx + 1}.
                  </span>
                )}
                <span>{pos}</span>
                {hasVoted && (
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, marginLeft: 2 }}>[VOTED]</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Official Digital Ballot Box (EVM Layout) */}
      <div className="glass-panel" style={{ padding: '26px 30px', marginBottom: 28 }}>
        {/* Ballot Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-upcoming" style={{ fontSize: '0.7rem' }}>
                OFFICIAL BALLOT SHEET
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Marwadi University Council Elections 2026
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4, margin: '4px 0 0' }}>
              Contested Post: <span style={{ color: '#38bdf8' }}>{selectedPosition}</span>
            </h2>
          </div>

          <div style={{ position: 'relative', width: 220 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 34, fontSize: '0.82rem', padding: '8px 12px 8px 34px' }}
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* State A: Already Voted for this position */}
        {hasVotedCurrentPos ? (
          <div style={{ padding: '42px 24px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <CheckCircle size={34} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#34d399', fontWeight: 800 }}>
              Ballot Successfully Recorded for {selectedPosition}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6, maxWidth: 540, margin: '6px auto 0' }}>
              Your vote has been cryptographically sealed into the tamper-proof ledger. Double voting is strictly prevented by university security protocols.
            </p>
            <div style={{ marginTop: 20 }}>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '0.85rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399' }}
                onClick={() => {
                  const nextIndex = positions.indexOf(selectedPosition) + 1;
                  if (nextIndex < positions.length) {
                    setSelectedPosition(positions[nextIndex]);
                  }
                }}
              >
                Next Position Ballot <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : candidatesForPosition.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Award size={42} style={{ marginBottom: 12, opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>No Approved Nominees</h3>
            <p style={{ fontSize: '0.88rem', marginTop: 4 }}>
              There are currently no approved candidates for <strong>{selectedPosition}</strong>.
            </p>
          </div>
        ) : (
          /* State B: Active Ballot Rows / EVM Table */
          <div className="evm-ballot-table">
            {candidatesForPosition.map((candidate, idx) => {
              const isSelected = selectedCandidate?.id === candidate.id;

              return (
                <div 
                  key={candidate.id} 
                  className={`evm-ballot-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => isLive && setSelectedCandidate(candidate)}
                  style={{ cursor: isLive ? 'pointer' : 'default' }}
                >
                  {/* 1. Serial No */}
                  <div className="evm-serial-badge">
                    0{idx + 1}
                  </div>

                  {/* 2. Official Symbol */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', lineHeight: 1, background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'inline-block' }}>
                      {candidate.symbolUrl || '🌟'}
                    </div>
                  </div>

                  {/* 3. Candidate Info & Photo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src={candidate.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.fullName}`}
                      alt={candidate.fullName}
                      style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid #2563eb', objectFit: 'cover', background: '#0a0f1d' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                        {candidate.fullName}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Roll No: <strong style={{ color: '#e2e8f0' }}>{candidate.studentId}</strong> &nbsp;•&nbsp; {candidate.department} (Sem {candidate.semester})
                      </div>
                    </div>
                  </div>

                  {/* 4. Manifesto Snippet */}
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700 }}>
                      Manifesto Agenda:
                    </span>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', margin: '2px 0 0', lineHeight: 1.35 }}>
                      "{candidate.manifesto || 'Dedicated to student empowerment and campus betterment.'}"
                    </p>
                  </div>

                  {/* 5. EVM Vote Trigger Button */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      className={`evm-button-cast ${isSelected ? 'cast-active' : ''}`}
                      disabled={!isLive}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLive) {
                          setVotingSelection({
                            election: currentElection,
                            candidate: candidate,
                            position: selectedPosition
                          });
                        }
                      }}
                    >
                      <Vote size={15} /> Vote Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {activeRulesElection && (
        <RulesModal
          election={activeRulesElection}
          onClose={() => setActiveRulesElection(null)}
        />
      )}

      {/* Self-Nomination Modal */}
      {nominateElection && (
        <NominateCandidateModal
          election={nominateElection}
          user={user}
          onClose={() => setNominateElection(null)}
          onNominationSuccess={fetchElections}
        />
      )}

      {/* Final Voting Confirmation Modal */}
      {votingSelection && (
        <VoteModal
          election={votingSelection.election}
          candidate={votingSelection.candidate}
          position={votingSelection.position}
          onClose={() => setVotingSelection(null)}
          onVoteSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}
