import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Clock, Trophy, ArrowRight, Play, 
  CheckCircle2, Vote, Award, Lock, HelpCircle, Mail, Phone, MapPin 
} from 'lucide-react';
import api from '../services/api';
import heroBallotImg from '../assets/hero_ballot.jpg';
import CountdownTimer from '../components/CountdownTimer';

export default function LandingPage({ onVoteNow, user }) {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    api.get('/elections').then((res) => {
      setElections(res.data);
      const allCands = [];
      res.data.forEach((e) => {
        if (e.candidates) allCands.push(...e.candidates);
      });
      setCandidates(allCands);
    }).catch(() => {});
  }, []);

  const activeElection = elections.find((e) => e.status === 'Active' || e.status === 'Live') || elections[0];

  return (
    <div>
      {/* 1. HERO SECTION matching the photo */}
      <section className="hero-wrapper">
        <div>
          <span className="hero-tag">College Elections 2026</span>
          
          <h1 className="hero-title">
            Your Vote.
            <span className="accent-text">Our Future.</span>
          </h1>

          <p className="hero-subtext">
            Choose. Support. Lead.<br />
            Be a part of the change.
          </p>

          <div className="hero-cta-group">
            <button className="btn-vote-now" onClick={onVoteNow}>
              Vote Now <ArrowRight size={18} />
            </button>

            <button className="btn-video-cta" onClick={() => setShowVideoModal(true)}>
              <Play size={16} fill="#ffffff" /> Watch Video
            </button>
          </div>
        </div>

        {/* Hero Visual Card with Hand inserting ballot into ballot box */}
        <div className="hero-visual-card">
          <img 
            src={heroBallotImg} 
            alt="Vote For A Brighter Campus - Marwadi University" 
            className="hero-visual-img" 
          />

          {/* Floating keywords matching the screenshot */}
          <div className="hero-keywords">
            <span className="hero-keyword">IDEAS</span>
            <span className="hero-keyword">PEOPLE</span>
            <span className="hero-keyword">PROGRESS</span>
          </div>
        </div>
      </section>

      {/* 2. FOUR FEATURE PILLARS RIBBON matching the bottom of the screenshot */}
      <section className="feature-ribbon">
        <div className="feature-pill">
          <div className="feature-pill-icon">
            <ShieldCheck size={22} color="#38bdf8" />
          </div>
          <div className="feature-pill-text">
            <h4>100% Secure Voting</h4>
            <p>HMAC-SHA256 privacy tokens</p>
          </div>
        </div>

        <div className="feature-pill">
          <div className="feature-pill-icon">
            <Users size={22} color="#38bdf8" />
          </div>
          <div className="feature-pill-text">
            <h4>Student Driven</h4>
            <p>Democratic campus leadership</p>
          </div>
        </div>

        <div className="feature-pill">
          <div className="feature-pill-icon">
            <Clock size={22} color="#38bdf8" />
          </div>
          <div className="feature-pill-text">
            <h4>Transparent Process</h4>
            <p>Real-time SignalR broadcasts</p>
          </div>
        </div>

        <div className="feature-pill">
          <div className="feature-pill-icon">
            <Trophy size={22} color="#38bdf8" />
          </div>
          <div className="feature-pill-text">
            <h4>A Better Tomorrow</h4>
            <p>Verified election results</p>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE CONTEST SPOTLIGHT & COUNTDOWN */}
      {activeElection && (
        <section style={{ margin: '40px 0' }} className="glass-panel" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div>
              <span className={`badge ${activeElection.status === 'Live' || activeElection.status === 'Active' ? 'badge-active' : 'badge-upcoming'}`}>
                {activeElection.status}
              </span>
              <h2 style={{ fontSize: '1.6rem', marginTop: 6 }}>{activeElection.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{activeElection.description}</p>
            </div>

            <button className="btn-vote-now" style={{ padding: '10px 22px', fontSize: '0.9rem' }} onClick={onVoteNow}>
              Enter Voting Booth <ArrowRight size={16} />
            </button>
          </div>

          {(activeElection.status === 'Live' || activeElection.status === 'Active') && (
            <div style={{ maxWidth: 360, margin: '16px 0' }}>
              <CountdownTimer targetDate={activeElection.endDate} label="Voting Closes in" />
            </div>
          )}
        </section>
      )}

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section style={{ margin: '50px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="hero-tag">Step-by-Step</span>
          <h2 style={{ fontSize: '2rem' }}>How Marwadi University Voting Works</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 4 }}>
            Simple, secure, and verifiable in 4 transparent steps.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div className="glass-panel" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: '1.2rem' }}>
              1
            </div>
            <h4>Enrollment Verification</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6 }}>
              Login with your Marwadi University Student ID and verified credentials.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0, 168, 150, 0.15)', color: '#00a896', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: '1.2rem' }}>
              2
            </div>
            <h4>Review Candidates</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6 }}>
              Explore candidate manifestos, qualifications, and contested positions.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: '1.2rem' }}>
              3
            </div>
            <h4>Cast Anonymous Vote</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6 }}>
              Submit your secret ballot protected by cryptographic voter tokens.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: '1.2rem' }}>
              4
            </div>
            <h4>Instant Receipt</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6 }}>
              Receive an anonymous confirmation receipt code verifying your vote.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CANDIDATE ROSTER SHOWCASE */}
      {candidates.length > 0 && (
        <section style={{ margin: '50px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="hero-tag">Meet the Nominees</span>
            <h2 style={{ fontSize: '2rem' }}>Contesting Candidates</h2>
          </div>

          <div className="candidate-grid">
            {candidates.slice(0, 4).map((c) => (
              <div key={c.id} className="candidate-card glass-panel">
                <img
                  src={c.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.fullName}`}
                  alt={c.fullName}
                  className="candidate-avatar"
                />
                <div>
                  <h4 style={{ fontSize: '1.05rem' }}>{c.fullName}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{c.position} • {c.department}</span>
                </div>
                <div className="candidate-symbol">{c.symbolUrl || '🌟'}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "{c.manifesto}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. CONTACT & ELECTION COMMISSION FOOTER */}
      <footer className="glass-panel" style={{ padding: '36px 32px', marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 8, color: '#38bdf8' }}>Marwadi University</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
            Office of the Chief Election Commissioner<br />
            Student Welfare & Democratic Council<br />
            Rajkot-Morbi Highway, Gujarat, India.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 10 }}>Election Helpdesk</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={14} color="#38bdf8" /> elections@marwadiuniversity.ac.in
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={14} color="#38bdf8" /> +91 281 7123456
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 10 }}>Security & Compliance</h4>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', lineHeight: 1.6 }}>
            Protected by ASP.NET Core & MongoDB cryptographic unique constraints. Zero voter tracking policy.
          </p>
        </div>
      </footer>

      {/* Video / Info Modal */}
      {showVideoModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '480px', textAlign: 'center' }}>
            <h3>Marwadi University Elections 2026</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '12px 0 20px' }}>
              Your vote shapes our student union, academic policies, sports infrastructure, and campus life.
            </p>
            <div style={{ padding: '24px', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
              <p style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.95rem' }}>
                "Every vote is a voice. Every voice builds our future."
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowVideoModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
