import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, X, Lock } from 'lucide-react';
import api from '../services/api';

export default function VoteModal({ election, candidate, position, onClose, onVoteSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handleConfirmVote = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/votes', {
        electionId: election.id,
        candidateId: candidate.id,
        position: position || candidate.position || 'President'
      });

      setReceipt(response.data.confirmationReceipt);
      if (onVoteSuccess) {
        onVoteSuccess(election.id, position || candidate.position || 'President');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit vote. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {!receipt ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Lock size={26} color="#6366f1" />
              </div>
              <h2>Confirm Your Vote</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                {election.title} &nbsp;•&nbsp; <strong style={{ color: 'var(--secondary)' }}>{position || candidate.position}</strong>
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 16, textAlign: 'center', marginBottom: 18 }}>
              <img 
                src={candidate.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.fullName}`} 
                alt={candidate.fullName} 
                className="candidate-avatar"
                style={{ width: 72, height: 72, margin: '0 auto 10px' }}
              />
              <h3 style={{ fontSize: '1.15rem' }}>{candidate.fullName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Student ID: {candidate.studentId} | {candidate.department}</p>
              <div style={{ marginTop: 8 }} className="candidate-symbol">
                {candidate.symbolUrl || '🗳️'}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 10, fontStyle: 'italic' }}>
                "{candidate.manifesto}"
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#10b981" />
              <span>Your ballot is encrypted and anonymized. Double-voting is strictly blocked.</span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleConfirmVote} disabled={loading}>
                {loading ? 'Submitting Ballot...' : `Confirm Vote for ${candidate.fullName.split(' ')[0]}`}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} color="#10b981" />
            </div>
            <h2>Vote Cast Successfully!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 6 }}>
              Your vote for <strong>{position || candidate.position}</strong> has been counted.
            </p>

            <div className="receipt-box">
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Anonymous Confirmation Receipt
              </span>
              <div className="receipt-code">{receipt}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 4 }}>
                Keep this code as verifiable proof of participation.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={onClose}>
              Done & Return to Ballot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
