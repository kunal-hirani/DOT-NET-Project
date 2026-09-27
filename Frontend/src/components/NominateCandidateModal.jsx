import React, { useState } from 'react';
import { UserCheck, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function NominateCandidateModal({ election, user, onClose, onNominationSuccess }) {
  const [position, setPosition] = useState(election.positions?.[0] || 'President');
  const [manifesto, setManifesto] = useState('');
  const [symbolUrl, setSymbolUrl] = useState('🌟');
  const [photoUrl, setPhotoUrl] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/candidates/nominate', {
        electionId: election.id,
        position,
        manifesto,
        symbolUrl,
        photoUrl
      });
      setSubmitted(true);
      if (onNominationSuccess) onNominationSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit candidacy nomination.');
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

        {!submitted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <UserCheck size={26} color="#8b5cf6" />
              </div>
              <h3>Self-Nomination for Candidacy</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{election.title}</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
                <div><strong>Candidate:</strong> {user.fullName} ({user.studentId})</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}><strong>Department:</strong> {user.department} &nbsp;|&nbsp; <strong>Semester:</strong> {user.semester}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Contested Position</label>
                <select className="form-select" value={position} onChange={(e) => setPosition(e.target.value)}>
                  {election.positions?.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Symbol / Emoji</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 🚀, ⚡, 🌿, 🎯, 🦅"
                  value={symbolUrl}
                  onChange={(e) => setSymbolUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Candidate Manifesto / Key Promises</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="Describe your campaign goals, background, and promises for students..."
                  value={manifesto}
                  onChange={(e) => setManifesto(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Submitting Application...' : 'Submit Nomination'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>
            <h3>Nomination Application Submitted!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8, lineHeight: 1.5 }}>
              Your candidacy nomination for <strong>{position}</strong> has been sent to the Election Committee for review. You will receive an in-app notification once approved.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={onClose}>
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
