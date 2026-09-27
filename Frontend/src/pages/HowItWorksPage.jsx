import React from 'react';
import { 
  ShieldCheck, Lock, UserCheck, Vote, CheckCircle2, 
  ArrowRight, Award, School, HelpCircle, FileText
} from 'lucide-react';

export default function HowItWorksPage({ onVoteNow }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: 50 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 26, background: 'linear-gradient(135deg, rgba(14, 20, 36, 0.95), rgba(7, 10, 18, 0.98))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', marginBottom: 8 }}>
              <School size={14} color="#38bdf8" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                System Architecture & Workflow
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              How College Online Voting Works
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 6, maxWidth: 620 }}>
              Learn how cryptographic tokens, role-based access control, and real-time SignalR broadcasts ensure a 100% fair and tamper-proof election.
            </p>
          </div>

          <button className="btn-vote-now" style={{ padding: '12px 26px', fontSize: '0.95rem' }} onClick={onVoteNow}>
            <Vote size={17} /> Go to Voting Booth
          </button>
        </div>
      </div>

      {/* 4 Step Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 36 }}>
        <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', marginBottom: 14 }}>
            01
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>1. Student Authentication</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Students login using their official Marwadi University enrollment number and password. JWT tokens securely verify student department, semester, and voting eligibility.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0, 168, 150, 0.15)', color: '#00a896', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', marginBottom: 14 }}>
            02
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>2. Candidate Evaluation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Voters browse approved student nominees across all contested positions (President, VP, GS, Sports Secretary) and read their manifestos and campaign promises.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', marginBottom: 14 }}>
            03
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>3. Cryptographic Ballot</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Upon clicking "Vote Now", an HMAC-SHA256 deterministic token is generated. The vote record is saved anonymously with zero link back to the student's personal identity.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', marginBottom: 14 }}>
            04
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>4. Live Results Broadcast</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
            Real-time SignalR WebSockets broadcast live vote counts to admin and public result dashboards simultaneously without requiring manual refreshes.
          </p>
        </div>
      </div>

      {/* Security Architecture Deep-Dive */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <ShieldCheck size={24} color="#10b981" />
          <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Cryptographic Anti-Tampering Protections</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: 6 }}>Double-Voting Prevention</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              MongoDB compound unique index on <code>(electionId, position, voterToken)</code> guarantees at the engine level that no student can cast more than one ballot per position.
            </p>
          </div>

          <div style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', color: '#00a896', marginBottom: 6 }}>100% Voter Anonymity</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              The ballot table stores only candidate IDs and timestamps. The student's name, roll number, and email are never recorded inside the votes collection.
            </p>
          </div>

          <div style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', color: '#f59e0b', marginBottom: 6 }}>Anonymous Receipt Proof</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Each voter receives a cryptographic receipt token (e.g. <code>RECEIPT-PRE-XXXXXX</code>) serving as immutable proof of participation without revealing candidate choice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
