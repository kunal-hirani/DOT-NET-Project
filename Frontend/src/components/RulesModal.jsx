import React from 'react';
import { ShieldCheck, X, FileText, CheckCircle2 } from 'lucide-react';

export default function RulesModal({ election, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '520px' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#6366f1" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Election Rules & Guidelines</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{election.title}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--primary)' }}>Voter Eligibility</h4>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-main)', paddingLeft: '20px', lineHeight: 1.6 }}>
            <li><strong>Eligible Departments:</strong> {election.eligibleDepartments?.join(', ') || 'All Departments'}</li>
            <li><strong>Eligible Semesters:</strong> Semesters {election.eligibleSemesters?.join(', ') || '1 through 8'}</li>
            <li><strong>Verification:</strong> Active enrollment with approved student status required.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--secondary)' }}>Official Instructions</h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {election.rules || '1. One vote per position per student.\n2. Ballots are submitted anonymously and cannot be altered.\n3. Cryptographic proof is issued upon vote submission.'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#a7f3d0', marginBottom: 20 }}>
          <ShieldCheck size={20} color="#10b981" />
          <span>Your voting identity is protected by HMAC-SHA256 privacy tokens. Admins cannot link your ballot to your name.</span>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
          <CheckCircle2 size={16} /> I Understand & Agree
        </button>
      </div>
    </div>
  );
}
