import React, { useState, useEffect } from 'react';
import MarwadiNavbar from './components/MarwadiNavbar';
import LandingPage from './pages/LandingPage';
import CandidatesDirectory from './pages/CandidatesDirectory';
import LiveResultsPage from './pages/LiveResultsPage';
import ContactPage from './pages/ContactPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import CandidatePortal from './pages/CandidatePortal';
import AdminDashboard from './pages/AdminDashboard';
import { signalRService } from './services/signalrService';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'candidates' | 'how-it-works' | 'results' | 'contact' | 'portal' | 'auth'

  useEffect(() => {
    const savedUser = localStorage.getItem('voting_user');
    const token = localStorage.getItem('voting_token');
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        signalRService.startConnection();
      } catch (err) {
        localStorage.clear();
      }
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    signalRService.startConnection();
    setActiveTab('portal');
  };

  const handleLogout = () => {
    localStorage.removeItem('voting_token');
    localStorage.removeItem('voting_user');
    signalRService.stopConnection();
    setUser(null);
    setActiveTab('home');
  };

  const handleVoteNow = () => {
    if (user) {
      setActiveTab('portal');
    } else {
      setActiveTab('auth');
    }
  };

  const isAdmin = user && (user.role?.includes('Admin') || user.role === 'Super Admin' || user.role === 'Election Admin');

  return (
    <div className="app-container">
      <MarwadiNavbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setActiveTab('auth')}
      />

      <main>
        {activeTab === 'auth' && !user ? (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onBackToHome={() => setActiveTab('home')}
          />
        ) : activeTab === 'portal' && user ? (
          isAdmin ? (
            <AdminDashboard user={user} />
          ) : user.role === 'Candidate' ? (
            <CandidatePortal user={user} onSwitchToVoting={() => setActiveTab('voting-portal')} />
          ) : (
            <StudentDashboard user={user} />
          )
        ) : activeTab === 'voting-portal' && user ? (
          <div>
            {user.role === 'Candidate' && (
              <div style={{ maxWidth: '1200px', margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '10px 18px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>
                  🎖️ You are currently viewing the <strong>Student Ballot</strong> as candidate <strong>{user.fullName}</strong>.
                </span>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('portal')}
                  style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: 'var(--radius-pill)' }}
                >
                  Return to Candidate Portal
                </button>
              </div>
            )}
            <StudentDashboard user={user} />
          </div>
        ) : activeTab === 'candidates' ? (
          <CandidatesDirectory onVoteNow={handleVoteNow} />
        ) : activeTab === 'results' ? (
          <LiveResultsPage onVoteNow={handleVoteNow} />
        ) : activeTab === 'contact' ? (
          <ContactPage />
        ) : activeTab === 'how-it-works' ? (
          <HowItWorksPage onVoteNow={handleVoteNow} />
        ) : (
          <LandingPage onVoteNow={handleVoteNow} user={user} />
        )}
      </main>
    </div>
  );
}
