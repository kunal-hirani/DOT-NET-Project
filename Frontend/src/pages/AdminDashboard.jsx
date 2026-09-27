import React, { useEffect, useState } from 'react';
import { 
  Users, Award, Calendar, CheckSquare, PlusCircle, Activity, 
  Trash2, Play, Pause, CheckCircle, ShieldCheck, UserX, UserCheck, 
  RefreshCw, Download, FileText, Printer, AlertTriangle, XCircle, Trophy 
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
import StatCard from '../components/StatCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [liveResult, setLiveResult] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'nominations' | 'elections' | 'users' | 'audit'

  // Modals
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showRemoveCandidateModal, setShowRemoveCandidateModal] = useState(false);

  // New Election Form
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    department: 'All',
    eligibleDepartments: ['All'],
    positions: ['President', 'Vice President', 'General Secretary', 'Sports Secretary'],
    rules: '1. One vote per position per student.\n2. Cryptographic anonymity guaranteed.\n3. Votes once cast cannot be changed.',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16)
  });

  // Direct Candidate Creation Form
  const [newCandidate, setNewCandidate] = useState({
    electionId: '',
    studentId: '',
    fullName: '',
    position: 'President',
    department: 'Computer Science',
    semester: 6,
    classDivision: 'A',
    manifesto: '',
    photoUrl: '',
    symbolUrl: '🌟'
  });

  const loadDashboardData = async () => {
    try {
      const [sumRes, elecRes, userRes, pendRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/elections'),
        api.get('/admin/users'),
        api.get('/candidates/pending')
      ]);

      setSummary(sumRes.data);
      setElections(elecRes.data);
      setUsersList(userRes.data);
      setPendingCandidates(pendRes.data);

      if (elecRes.data.length > 0 && !selectedElectionId) {
        setSelectedElectionId(elecRes.data[0].id);
        fetchLiveResult(elecRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    }
  };

  const fetchLiveResult = async (electionId) => {
    if (!electionId) return;
    try {
      const res = await api.get(`/admin/results/${electionId}`);
      setLiveResult(res.data);
    } catch (err) {
      console.error('Failed to load election results:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();

    signalRService.joinAdminDashboard();

    signalRService.onDashboardUpdate((updatedResult) => {
      if (selectedElectionId === updatedResult.electionId) {
        setLiveResult(updatedResult);
      }
      api.get('/admin/dashboard').then((res) => setSummary(res.data));
    });
  }, [selectedElectionId]);

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/elections', {
        ...newElection,
        startDate: new Date(newElection.startDate).toISOString(),
        endDate: new Date(newElection.endDate).toISOString()
      });
      setShowCreateElection(false);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create election.');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/candidates', newCandidate);
      setShowAddCandidate(false);
      loadDashboardData();
      if (newCandidate.electionId === selectedElectionId) {
        fetchLiveResult(selectedElectionId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add candidate.');
    }
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    if (!window.confirm(`Are you sure you want to remove candidate "${candidateName}" from this election?`)) {
      return;
    }
    try {
      await api.delete(`/candidates/${candidateId}`);
      loadDashboardData();
      if (selectedElectionId) {
        fetchLiveResult(selectedElectionId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove candidate.');
    }
  };

  const handleUpdateStatus = async (electionId, status) => {
    try {
      await api.put(`/elections/${electionId}/status`, JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
      });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleCandidateVerification = async (candidateId, status, notes = '') => {
    try {
      await api.put(`/candidates/${candidateId}/status`, { status, notes });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update candidate status.');
    }
  };

  const handleToggleApproval = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/approval`, !currentStatus, {
        headers: { 'Content-Type': 'application/json' }
      });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDownloadCsv = (type) => {
    if (!selectedElectionId) return;
    const url = `http://localhost:5000/api/admin/reports/${type}/${selectedElectionId}/csv`;
    window.open(url, '_blank');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Chart Data
  const chartData = {
    labels: liveResult?.candidates?.map((c) => `${c.fullName} (${c.position})`) || [],
    datasets: [
      {
        label: 'Votes Cast',
        data: liveResult?.candidates?.map((c) => c.voteCount) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.85)',
          'rgba(6, 182, 212, 0.85)',
          'rgba(139, 92, 246, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(239, 68, 68, 0.85)'
        ],
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Live Election Tally: ${liveResult?.electionTitle || ''}`,
        color: '#f8fafc',
        font: { size: 15, family: 'Outfit', weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false }
      }
    }
  };

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2>Election Commission Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 3 }}>
            Admin: <strong>{user?.fullName}</strong> &nbsp;|&nbsp; Role: <strong>{user?.role}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handlePrintReport} title="Print / Save PDF Report">
            <Printer size={15} /> Print Report
          </button>
          <button className="btn btn-secondary" onClick={loadDashboardData}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateElection(true)}>
            <PlusCircle size={15} /> Schedule Election
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <StatCard title="Registered Students" value={summary?.totalVoters ?? 0} icon={Users} color="#6366f1" />
        <StatCard title="Active / Live Elections" value={summary?.activeElections ?? 0} icon={Calendar} color="#06b6d4" />
        <StatCard title="Contesting Candidates" value={summary?.totalCandidates ?? 0} icon={Award} color="#8b5cf6" />
        <StatCard title="Total Anonymous Ballots" value={summary?.totalVotesCast ?? 0} icon={CheckSquare} color="#10b981" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Live Results & Analytics' },
          { id: 'nominations', label: `Candidate Approvals (${pendingCandidates.length})`, alert: pendingCandidates.length > 0 },
          { id: 'elections', label: 'Election Controls' },
          { id: 'users', label: 'Student Management' },
          { id: 'audit', label: 'Security & Audit Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '7px 14px', position: 'relative' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME CHART */}
      {activeTab === 'overview' && (
        <div>
          {/* CSV Export & Election Selector Header */}
          <div className="glass-panel" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Selected Contest:</span>
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: 240 }}
                value={selectedElectionId}
                onChange={(e) => {
                  setSelectedElectionId(e.target.value);
                  fetchLiveResult(e.target.value);
                }}
              >
                {elections.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.status})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => handleDownloadCsv('results')}>
                <Download size={14} /> Export Results (CSV)
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => handleDownloadCsv('turnout')}>
                <Download size={14} /> Export Turnout (CSV)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
            {/* Live Chart Panel */}
            <div className="glass-panel" style={{ padding: 22, gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={18} color="#10b981" />
                  <h3 style={{ fontSize: '1.1rem' }}>Live Vote Distribution</h3>
                </div>
                <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                  Total: {liveResult?.totalVotes || 0} Votes
                </span>
              </div>

              {liveResult?.candidates?.length > 0 ? (
                <div className="chart-container">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  No candidates registered or votes cast for this election yet.
                </div>
              )}
            </div>

            {/* Candidate Standings / Winner Panel */}
            <div className="glass-panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Position Standings</h3>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setNewCandidate({ ...newCandidate, electionId: selectedElectionId });
                      setShowAddCandidate(true);
                    }}
                  >
                    <PlusCircle size={13} /> Add Candidate
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {liveResult?.candidates?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No candidates in this election yet.
                    </div>
                  ) : (
                    liveResult?.candidates?.map((c, i) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: i === 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                            #{i + 1}
                          </span>
                          <img
                            src={c.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.fullName}`}
                            alt={c.fullName}
                            style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.fullName} {c.symbolUrl}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{c.position} • {c.studentId}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem' }}>{c.voteCount} votes</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.votePercentage}%</div>
                          </div>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 8px', fontSize: '0.7rem', borderRadius: 'var(--radius-sm)' }}
                            onClick={() => handleDeleteCandidate(c.id, c.fullName)}
                            title={`Remove ${c.fullName}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Downside Space: Remove Candidate Button at the Bottom */}
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  className="btn btn-danger" 
                  style={{ width: '100%', padding: '9px 14px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={() => setShowRemoveCandidateModal(true)}
                  disabled={!liveResult?.candidates || liveResult.candidates.length === 0}
                >
                  <Trash2 size={14} /> Remove Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE APPROVAL QUEUE */}
      {activeTab === 'nominations' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 14 }}>Student Candidacy Verification Queue</h3>
          {pendingCandidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <CheckCircle size={36} color="#10b981" style={{ marginBottom: 8 }} />
              <h4>No Pending Nominations</h4>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>All student candidacy applications have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pendingCandidates.map((cand) => (
                <div key={cand.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src={cand.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cand.fullName}`}
                      alt={cand.fullName}
                      style={{ width: 46, height: 46, borderRadius: '50%' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1rem' }}>{cand.fullName} ({cand.studentId})</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>Contesting for: {cand.position}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Dept: {cand.department} • Sem: {cand.semester} ({cand.classDivision}) • Symbol: {cand.symbolUrl}</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>"{cand.manifesto}"</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleCandidateVerification(cand.id, 'Approved', 'Verified eligibility.')}>
                      <CheckCircle size={14} /> Approve Candidacy
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleCandidateVerification(cand.id, 'Rejected', 'Did not meet nomination criteria.')}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ELECTIONS MANAGER */}
      {activeTab === 'elections' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Manage Election Lifecycle</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {elections.map((election) => (
              <div key={election.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 18, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h4 style={{ fontSize: '1.05rem' }}>{election.title}</h4>
                    <span className={`badge ${election.status === 'Live' || election.status === 'Active' ? 'badge-active' : election.status === 'Upcoming' ? 'badge-upcoming' : election.status === 'Paused' ? 'badge-paused' : election.status === 'Draft' ? 'badge-draft' : 'badge-completed'}`}>
                      {election.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{election.description}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 4 }}>
                    Positions: <strong>{election.positions?.join(', ')}</strong> &nbsp;|&nbsp; Eligibility: {election.department} (Semesters: {election.eligibleSemesters?.join(', ')})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {election.status !== 'Live' && election.status !== 'Active' && election.status !== 'Completed' && (
                    <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => handleUpdateStatus(election.id, 'Live')}>
                      <Play size={13} /> Start Live
                    </button>
                  )}
                  {(election.status === 'Live' || election.status === 'Active') && (
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => handleUpdateStatus(election.id, 'Paused')}>
                      <Pause size={13} /> Pause
                    </button>
                  )}
                  {election.status === 'Paused' && (
                    <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => handleUpdateStatus(election.id, 'Live')}>
                      <Play size={13} /> Resume
                    </button>
                  )}
                  {election.status !== 'Completed' && (
                    <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => handleUpdateStatus(election.id, 'Completed')}>
                      <CheckCircle size={13} /> Declare Concluded
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                    onClick={() => {
                      setNewCandidate({ ...newCandidate, electionId: election.id });
                      setShowAddCandidate(true);
                    }}
                  >
                    + Nominate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Student Database & Voter Eligibility</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Student / Enrollment</th>
                  <th style={{ padding: '10px 12px' }}>Full Name</th>
                  <th style={{ padding: '10px 12px' }}>Email</th>
                  <th style={{ padding: '10px 12px' }}>Department</th>
                  <th style={{ padding: '10px 12px' }}>Semester</th>
                  <th style={{ padding: '10px 12px' }}>Role</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.studentId}</td>
                    <td style={{ padding: '10px 12px' }}>{u.fullName}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>{u.department}</td>
                    <td style={{ padding: '10px 12px' }}>Sem {u.semester} ({u.classDivision})</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${u.role.includes('Admin') ? 'badge-draft' : 'badge-active'}`} style={{ fontSize: '0.65rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: u.isApproved ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.78rem' }}>
                        {u.isApproved ? 'Approved' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {!u.role.includes('Admin') && (
                        <button
                          className={`btn ${u.isApproved ? 'btn-danger' : 'btn-primary'}`}
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          onClick={() => handleToggleApproval(u.id, u.isApproved)}
                        >
                          {u.isApproved ? <UserX size={13} /> : <UserCheck size={13} />}
                          {u.isApproved ? 'Suspend' : 'Approve'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 14 }}>Security & Vote Transaction Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {summary?.recentActivity?.map((log) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                <div>
                  <span className="badge badge-active" style={{ fontSize: '0.62rem', marginRight: 8 }}>
                    {log.action}
                  </span>
                  <strong>{log.details}</strong>
                  <span style={{ color: 'var(--text-subtle)', marginLeft: 8, fontSize: '0.72rem' }}>
                    by {log.performedBy}
                  </span>
                </div>
                <span style={{ color: 'var(--text-subtle)', fontSize: '0.72rem' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE MULTI-POSITION ELECTION */}
      {showCreateElection && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3>Schedule Multi-Position College Election</h3>
            <form onSubmit={handleCreateElection} style={{ marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">Election Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Student Council General Elections 2026"
                  value={newElection.title}
                  onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Details and guidelines..."
                  value={newElection.description}
                  onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Eligible Department</label>
                <select
                  className="form-select"
                  value={newElection.department}
                  onChange={(e) => setNewElection({ ...newElection, department: e.target.value, eligibleDepartments: [e.target.value] })}
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    required
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    required
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contested Positions (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="President, Vice President, General Secretary, Sports Secretary"
                  value={newElection.positions.join(', ')}
                  onChange={(e) => setNewElection({ ...newElection, positions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateElection(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Schedule Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT ADD CANDIDATE */}
      {showAddCandidate && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3>Nominate Candidate Directly</h3>
            <form onSubmit={handleAddCandidate} style={{ marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">Election</label>
                <select
                  className="form-select"
                  required
                  value={newCandidate.electionId}
                  onChange={(e) => setNewCandidate({ ...newCandidate, electionId: e.target.value })}
                >
                  <option value="">Select Election</option>
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>{el.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. STU-2026-099"
                    value={newCandidate.studentId}
                    onChange={(e) => setNewCandidate({ ...newCandidate, studentId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Michael Ross"
                    value={newCandidate.fullName}
                    onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contested Position</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. President or Sports Secretary"
                  value={newCandidate.position}
                  onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Symbol / Emoji</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 🚀, 🌿, ⚡, 🦅"
                  value={newCandidate.symbolUrl}
                  onChange={(e) => setNewCandidate({ ...newCandidate, symbolUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Manifesto</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  required
                  placeholder="Key campaign promises..."
                  value={newCandidate.manifesto}
                  onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddCandidate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REMOVE CANDIDATE SELECTOR */}
      {showRemoveCandidateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8, color: '#fca5a5' }}>
                <Trash2 size={18} /> Remove Candidate
              </h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem' }} 
                onClick={() => setShowRemoveCandidateModal(false)}
              >
                Close
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Select a candidate from <strong>{liveResult?.electionTitle || 'this election'}</strong> to remove from the ballot:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
              {liveResult?.candidates?.map((cand) => (
                <div 
                  key={cand.id} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={cand.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cand.fullName}`}
                      alt={cand.fullName}
                      style={{ width: 38, height: 38, borderRadius: '50%' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cand.fullName} {cand.symbolUrl}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                        {cand.position} • Roll: {cand.studentId} • {cand.voteCount} votes
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => {
                      handleDeleteCandidate(cand.id, cand.fullName);
                      setShowRemoveCandidateModal(false);
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
