import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Shield, CheckCircle2, ArrowLeft, Award, Sparkles } from 'lucide-react';
import api from '../services/api';
import marwadiLogo from '../assets/marwadi_official_white_logo.png';

const SYMBOLS = ['🌟', '🚀', '🦁', '⚡', '🦅', '🎯', '💡', '🛡️', '🏆', '🔥'];

export default function AuthPage({ onAuthSuccess, onBackToHome }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    emailOrStudentId: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    role: 'Student', // 'Student' or 'Candidate'
    studentId: '',
    enrollmentNo: '',
    fullName: '',
    email: '',
    department: 'Computer Science',
    semester: 1,
    classDivision: 'A',
    password: '',
    position: 'President',
    manifesto: '',
    symbolUrl: '🌟'
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', loginData);
      localStorage.setItem('voting_token', res.data.token);
      localStorage.setItem('voting_user', JSON.stringify(res.data));
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        studentId: registerData.studentId.trim(),
        enrollmentNo: registerData.enrollmentNo.trim() || registerData.studentId.trim(),
        fullName: registerData.fullName.trim(),
        email: registerData.email.trim(),
        department: registerData.department,
        semester: Number(registerData.semester),
        classDivision: registerData.classDivision,
        password: registerData.password,
        role: registerData.role,
        ...(registerData.role === 'Candidate' && {
          position: registerData.position,
          manifesto: registerData.manifesto || 'Dedicated to student representation and campus excellence.',
          symbolUrl: registerData.symbolUrl || '🌟'
        })
      };

      const res = await api.post('/auth/register', payload);
      localStorage.setItem('voting_token', res.data.token);
      localStorage.setItem('voting_user', JSON.stringify(res.data));
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (role) => {
    setIsRegister(false);
    if (role === 'admin') {
      setLoginData({
        emailOrStudentId: 'admin@college.edu',
        password: 'Admin@123'
      });
    } else if (role === 'candidate') {
      setLoginData({
        emailOrStudentId: 'candidate@college.edu',
        password: 'Password123'
      });
    } else {
      setLoginData({
        emailOrStudentId: 'student@college.edu',
        password: 'Password123'
      });
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '36px 32px' }}>
        {onBackToHome && (
          <button 
            onClick={onBackToHome} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer', marginBottom: 16 }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img 
            src={marwadiLogo} 
            alt="Marwadi University" 
            style={{ height: '44px', width: 'auto', margin: '0 auto 12px', display: 'block', objectFit: 'contain' }} 
          />
          <h2 style={{ fontSize: '1.4rem' }}>Student & Candidate Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
            Sign in or register with your verified university credentials
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-pill)', padding: '4px', marginBottom: '22px' }}>
          <button
            className={`btn ${!isRegister ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem', borderRadius: 'var(--radius-pill)' }}
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            className={`btn ${isRegister ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem', borderRadius: 'var(--radius-pill)' }}
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            <UserPlus size={15} /> Registration
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!isRegister ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Student ID, Candidate ID, or Email</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. STU-2026-001, CAND-2026-001, or admin@college.edu"
                value={loginData.emailOrStudentId}
                onChange={(e) => setLoginData({ ...loginData, emailOrStudentId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', borderRadius: 'var(--radius-pill)' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Sign In to Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            {/* Account Role Selector */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Register As</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setRegisterData({ ...registerData, role: 'Student' })}
                  className={`btn ${registerData.role === 'Student' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
                >
                  <CheckCircle2 size={14} /> Student Voter
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterData({ ...registerData, role: 'Candidate' })}
                  className={`btn ${registerData.role === 'Candidate' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 12px', fontSize: '0.82rem', justifyContent: 'center' }}
                >
                  <Award size={14} /> Candidate / Nominee
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">
                  {registerData.role === 'Candidate' ? 'Candidate / Student ID' : 'Student ID (Roll No)'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={registerData.role === 'Candidate' ? 'e.g. CAND-2026-050' : 'e.g. STU-2026-045'}
                  value={registerData.studentId}
                  onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Enrollment No</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 92100103001"
                  value={registerData.enrollmentNo}
                  onChange={(e) => setRegisterData({ ...registerData, enrollmentNo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Aarav Patel"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">University Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="e.g. aarav.patel@marwadiuniversity.ac.in"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={registerData.department}
                  onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  className="form-select"
                  value={registerData.semester}
                  onChange={(e) => setRegisterData({ ...registerData, semester: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate-Specific Fields */}
            {registerData.role === 'Candidate' && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>
                  <Award size={15} /> Candidacy Details
                </div>

                <div className="form-group">
                  <label className="form-label">Contested Position</label>
                  <select
                    className="form-select"
                    value={registerData.position}
                    onChange={(e) => setRegisterData({ ...registerData, position: e.target.value })}
                  >
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="General Secretary">General Secretary</option>
                    <option value="Sports Secretary">Sports Secretary</option>
                    <option value="Cultural Secretary">Cultural Secretary</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Campaign Symbol</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setRegisterData({ ...registerData, symbolUrl: sym })}
                        style={{
                          fontSize: '1.25rem',
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: registerData.symbolUrl === sym ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                          background: registerData.symbolUrl === sym ? 'rgba(99,102,241,0.25)' : 'rgba(0,0,0,0.3)',
                          cursor: 'pointer'
                        }}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Campaign Manifesto / Agenda</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Briefly state your campaign vision, student welfare initiatives..."
                    value={registerData.manifesto}
                    onChange={(e) => setRegisterData({ ...registerData, manifesto: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password (Min 6 chars)</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={6}
                placeholder="••••••••"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', borderRadius: 'var(--radius-pill)' }} disabled={loading}>
              {loading ? 'Creating Account...' : registerData.role === 'Candidate' ? 'Register as Candidate' : 'Register Student Account'}
            </button>
          </form>
        )}

        {/* Quick Demo Autofill */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px', textAlign: 'center' }}>
            ⚡ One-Click Demo Logins
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '7px 4px', justifyContent: 'center' }} onClick={() => fillQuickLogin('admin')}>
              <Shield size={13} color="#8b5cf6" /> Admin Demo
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '7px 4px', justifyContent: 'center' }} onClick={() => fillQuickLogin('candidate')}>
              <Award size={13} color="#38bdf8" /> Candidate
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '7px 4px', justifyContent: 'center' }} onClick={() => fillQuickLogin('student')}>
              <CheckCircle2 size={13} color="#10b981" /> Student Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

