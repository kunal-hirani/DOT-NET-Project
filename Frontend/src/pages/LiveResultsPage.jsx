import React, { useEffect, useState } from 'react';
import { 
  Trophy, Activity, Users, CheckCircle2, TrendingUp, 
  Award, Clock, ArrowRight, ShieldCheck, RefreshCw, Vote
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { signalRService } from '../services/signalrService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function LiveResultsPage({ onVoteNow }) {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections');
      setElections(res.data);
      if (res.data.length > 0 && !selectedElectionId) {
        setSelectedElectionId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load elections for live results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();

    // SignalR Live vote updates
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
  const allCandidates = currentElection?.candidates || [];
  const positions = currentElection?.positions || ['President', 'Vice President', 'General Secretary', 'Sports Secretary'];

  const totalVotesCast = allCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

  // Group candidates by position
  const candidatesByPosition = positions.reduce((acc, pos) => {
    acc[pos] = allCandidates.filter((c) => c.position === pos);
    return acc;
  }, {});

  const displayedPositions = selectedPosition === 'All' ? positions : [selectedPosition];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '90px 0', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: 14, height: 14, margin: '0 auto 16px' }} />
        <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Loading Real-Time Live Results...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: 50 }}>
      {/* 1. Header Banner */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(14, 20, 36, 0.95), rgba(7, 10, 18, 0.98))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: 8 }}>
              <div className="pulse-dot" style={{ background: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SignalR Real-Time Telemetry Active
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              Live Election Results & Tallies
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 6, maxWidth: 620 }}>
              Real-time cryptographic vote counting for Marwadi University Student Council. Charts update automatically without page reloads.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn-vote-now" style={{ padding: '12px 26px', fontSize: '0.95rem' }} onClick={onVoteNow}>
              <Vote size={17} /> Cast Your Ballot
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPIs Summary Bar */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6' }}>
            <Vote size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalVotesCast}</h3>
            <p>Total Ballots Counted</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(0, 168, 150, 0.15)', color: '#00a896' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{allCandidates.length}</h3>
            <p>Contesting Candidates</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <h3>{positions.length}</h3>
            <p>Contested Positions</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>100%</h3>
            <p>Verified Integrity</p>
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 22px', marginBottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <div style={{ minWidth: 260 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Election</label>
            <select 
              className="form-select" 
              style={{ marginTop: 4, fontWeight: 700 }}
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
            >
              {elections.map((e) => (
                <option key={e.id} value={e.id}>{e.title} ({e.status})</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: 200 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filter by Position</label>
            <select 
              className="form-select" 
              style={{ marginTop: 4 }}
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              <option value="All">All Positions</option>
              {positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${currentElection?.status === 'Live' || currentElection?.status === 'Active' ? 'badge-active' : 'badge-completed'}`}>
            {currentElection?.status || 'Active'}
          </span>
          <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={fetchElections} title="Refresh results">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* 4. Position-Wise Live Results Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {displayedPositions.map((pos) => {
          const cands = candidatesByPosition[pos] || [];
          const posVotes = cands.reduce((sum, c) => sum + (c.voteCount || 0), 0);
          
          // Sort descending by vote count to find leader
          const sortedCands = [...cands].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
          const leader = sortedCands.length > 0 && (sortedCands[0].voteCount || 0) > 0 ? sortedCands[0] : null;

          const chartData = {
            labels: cands.map((c) => c.fullName),
            datasets: [
              {
                label: 'Votes Cast',
                data: cands.map((c) => c.voteCount || 0),
                backgroundColor: [
                  'rgba(37, 99, 235, 0.8)',
                  'rgba(0, 168, 150, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                  '#2563eb',
                  '#00a896',
                  '#f59e0b',
                  '#8b5cf6',
                  '#ef4444',
                ],
                borderWidth: 1,
                borderRadius: 6,
              }
            ]
          };

          const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const count = context.parsed.y;
                    const pct = posVotes > 0 ? Math.round((count / posVotes) * 100) : 0;
                    return ` ${count} votes (${pct}%)`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#94a3b8' },
                grid: { color: 'rgba(255, 255, 255, 0.06)' }
              },
              x: {
                ticks: { color: '#e2e8f0', font: { weight: 'bold' } },
                grid: { display: false }
              }
            }
          };

          return (
            <div key={pos} className="glass-panel" style={{ padding: '26px 30px' }}>
              {/* Position Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    CONTESTED POSITION
                  </span>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '2px 0 0', color: '#fff' }}>
                    {pos} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>({posVotes} Total Votes)</span>
                  </h2>
                </div>

                {leader && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '6px 14px', borderRadius: 'var(--radius-pill)' }}>
                    <Trophy size={16} color="#f59e0b" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24' }}>
                      Leading: {leader.fullName} ({leader.voteCount} votes)
                    </span>
                  </div>
                )}
              </div>

              {cands.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  <Award size={36} style={{ opacity: 0.5, marginBottom: 8 }} />
                  <p>No candidates registered for this position yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(280px, 1fr)', gap: 24, alignItems: 'center' }}>
                  {/* Chart View */}
                  <div style={{ height: 260 }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>

                  {/* Candidate Tally Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sortedCands.map((c, idx) => {
                      const pct = posVotes > 0 ? Math.round(((c.voteCount || 0) / posVotes) * 100) : 0;
                      const isLeader = idx === 0 && (c.voteCount || 0) > 0;

                      return (
                        <div 
                          key={c.id} 
                          style={{ 
                            padding: '12px 16px', 
                            borderRadius: 'var(--radius-sm)', 
                            background: isLeader ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255,255,255,0.03)', 
                            border: isLeader ? '1px solid #2563eb' : '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: '1.4rem' }}>{c.symbolUrl || '🌟'}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {c.fullName}
                                {isLeader && <span className="badge badge-active" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>LEADER</span>}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {c.department} • Roll No: {c.studentId}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isLeader ? '#38bdf8' : '#e2e8f0' }}>
                              {c.voteCount || 0}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                              {pct}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
