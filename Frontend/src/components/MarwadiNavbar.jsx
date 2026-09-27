import React, { useEffect, useState } from 'react';
import { Vote, Shield, User, LogOut, Bell, Sun, Moon, ArrowRight } from 'lucide-react';
import { signalRService } from '../services/signalrService';
import api from '../services/api';
import marwadiLogo from '../assets/marwadi_official_white_logo.png';

export default function MarwadiNavbar({ user, onLogout, activeTab, setActiveTab, onOpenAuth }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="navbar-custom">
      {/* Brand Logo: Official Marwadi University Logo with Teal Shield & White Typography */}
      <div 
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setActiveTab('home')}
      >
        <img 
          src={marwadiLogo} 
          alt="Marwadi University" 
          style={{ height: '44px', width: 'auto', display: 'block', objectFit: 'contain' }} 
        />
      </div>

      {/* Navigation Links from the screenshot */}
      <ul className="nav-links">
        <li>
          <span 
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </span>
        </li>
        <li>
          <span 
            className={`nav-link ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            Candidates
          </span>
        </li>
        <li>
          <span 
            className={`nav-link ${activeTab === 'how-it-works' ? 'active' : ''}`}
            onClick={() => setActiveTab('how-it-works')}
          >
            How it Works
          </span>
        </li>
        <li>
          <span 
            className={`nav-link ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Live Results
          </span>
        </li>
        <li>
          <span 
            className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </span>
        </li>
      </ul>

      {/* Right Action CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {!user ? (
          <button className="nav-auth-btn" onClick={onOpenAuth}>
            Login / Register
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ padding: '7px 10px', borderRadius: 'var(--radius-pill)', position: 'relative' }}
                title="Notifications"
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="notification-dropdown glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                    <h4 style={{ fontSize: '0.9rem' }}>Notifications</h4>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Portal Switch based on role */}
            <button
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setActiveTab('portal')}
            >
              {user.role?.includes('Admin') ? 'Admin Dashboard' : user.role === 'Candidate' ? 'Candidate Portal' : 'Voter Portal'}
            </button>

            {/* User details badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600 }}>{user.fullName.split(' ')[0]}</span>
              <span className="badge badge-active" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>{user.role}</span>
            </div>

            {/* Logout button */}
            <button className="btn btn-secondary" onClick={onLogout} title="Sign Out" style={{ padding: '7px 10px', borderRadius: 'var(--radius-pill)' }}>
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
