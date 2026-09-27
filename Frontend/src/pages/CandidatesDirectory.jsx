import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Award, UserCheck, ChevronRight, Vote, 
  CheckCircle2, Sparkles, BookOpen, Layers, ShieldCheck, 
  ExternalLink, GraduationCap, School
} from 'lucide-react';
import api from '../services/api';

export default function CandidatesDirectory({ onVoteNow }) {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);

  useEffect(() => {
    api.get('/elections').then((res) => {
      setElections(res.data);
      if (res.data.length > 0) {
        setSelectedElectionId(res.data[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const currentElection = elections.find((e) => e.id === selectedElectionId) || elections[0];
  const allCandidates = currentElection?.candidates || [];

  const availablePositions = currentElection?.positions?.length > 0 
    ? currentElection.positions 
    : ['President', 'Vice President', 'General Secretary', 'Sports Secretary'];
  
  const positionsWithAll = ['All', ...availablePositions];
  const departments = [
    'All', 
    'Computer Science & Engineering', 
    'Information Technology', 
    'Mechanical Engineering', 
    'Electrical Engineering', 
    'Business Administration & MBA', 
    'Pharmacy & Health Sciences'
  ];

  const filteredCandidates = allCandidates.filter((c) => {
    const matchesPosition = selectedPosition === 'All' || c.position === selectedPosition;
    const matchesDept = selectedDepartment === 'All' || c.department === selectedDepartment || (c.department && c.department.includes(selectedDepartment.split(' ')[0]));
    const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.manifesto && c.manifesto.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPosition && matchesDept && matchesSearch;
  });

  const getCandidateCount = (pos) => {
    if (pos === 'All') return allCandidates.length;
    return allCandidates.filter((c) => c.position === pos).length;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '90px 0', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: 14, height: 14, margin: '0 auto 16px' }} />
        <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Loading Marwadi University Candidates Directory...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: 40 }}>
      {/* 1. Header Banner */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(14, 20, 36, 0.95), rgba(7, 10, 18, 0.98))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', marginBottom: 8 }}>
              <School size={14} color="#38bdf8" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Marwadi University Student Council 2026
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              Candidates & Manifestos
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 6, maxWidth: 620 }}>
              Review verified student nominees, official campaign symbols, and manifestos before casting your official ballot.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              className="btn-vote-now" 
              style={{ padding: '12px 26px', fontSize: '0.95rem' }} 
              onClick={onVoteNow}
            >
              <Vote size={17} /> Go to Voting Booth
            </button>
          </div>
        </div>
      </div>

      {/* 2. Position Filter Tabs / Chips */}
      <div className="pos-filter-bar">
        {positionsWithAll.map((pos) => {
          const isActive = selectedPosition === pos;
          const count = getCandidateCount(pos);
          return (
            <button
              key={pos}
              className={`pos-chip ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedPosition(pos)}
            >
              <span>{pos === 'All' ? 'All Candidates' : pos}</span>
              <span className="pos-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 38, fontSize: '0.88rem' }}
              placeholder="Search by student name, enrollment no, or manifesto keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <select 
              className="form-select" 
              style={{ fontSize: '0.88rem' }}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments / Faculties' : d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing <strong style={{ color: '#fff' }}>{filteredCandidates.length}</strong> verified nominees
        </div>
      </div>

      {/* 4. Candidate Cards Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Award size={48} style={{ marginBottom: 14, opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>No Candidates Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: 6, maxWidth: 440, margin: '6px auto 0' }}>
            No nominees match your current position or department filters. Try clearing your search parameters.
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: 18, borderRadius: 'var(--radius-pill)' }}
            onClick={() => { setSelectedPosition('All'); setSelectedDepartment('All'); setSearchQuery(''); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {filteredCandidates.map((c) => (
            <div key={c.id} className="practical-candidate-card">
              <div>
                {/* Card Top: Position & Symbol */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span className="badge badge-active" style={{ fontSize: '0.74rem', padding: '5px 12px', background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    {c.position}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Symbol:</span>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{c.symbolUrl || '🗳️'}</span>
                  </div>
                </div>

                {/* Candidate Identity Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={c.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.fullName}`}
                      alt={c.fullName}
                      style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid #2563eb', objectFit: 'cover', background: '#0a0f1d' }}
                    />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#10b981', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #070a12' }} title="Verified Candidate">
                      <CheckCircle2 size={12} />
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      {c.fullName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      Roll No: <strong style={{ color: '#e2e8f0' }}>{c.studentId}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GraduationCap size={13} />
                      <span>{c.department || 'Engineering'} • Sem {c.semester || 'VI'} ({c.classDivision || 'Div A'})</span>
                    </div>
                  </div>
                </div>

                {/* Manifesto Callout Box */}
                <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <BookOpen size={13} color="#94a3b8" />
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Official Campaign Manifesto
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#f1f5f9', fontStyle: 'italic', lineHeight: 1.45, margin: 0 }}>
                    "{c.manifesto || 'Committed to fostering campus innovation, transparent governance, and comprehensive student welfare.'}"
                  </p>
                </div>

                {/* Key Agenda Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    ✓ 24/7 Campus Facilities
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    ✓ Academic Representation
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    ✓ Hackathons & Cultural Fests
                  </span>
                </div>
              </div>

              {/* Action Button: Jump directly to Vote */}
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', borderRadius: 'var(--radius-pill)', padding: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                onClick={onVoteNow}
              >
                <Vote size={16} /> Vote for {c.fullName.split(' ')[0]} on Ballot
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
