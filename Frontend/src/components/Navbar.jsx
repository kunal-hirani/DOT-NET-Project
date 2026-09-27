import React, { useEffect, useState } from 'react';
import { Vote, Shield, User, LogOut, Bell, Sun, Moon, Check, Award, FileText } from 'lucide-react';
import { signalRService } from '../services/signalrService';
import api from '../services/api';

export default function Navbar({ user, onLogout, activeTab, setActiveTab, theme, toggleTheme }) {
  const [isLive, setIsLive] = useState(signalRService.isConnected);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      // Ignored
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleStatus = (status) => setIsLive(status);
    signalRService.onStatusChange(handleStatus);

    // Listen to real-time notification push over SignalR
    signalRService.connection?.on('ReceiveNotification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => signalRService.offStatusChange(handleStatus);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  return (
    <header className="navbar glass-panel">
      <div className="brand-badge" onClick={() => setActiveTab('elections')}>
        <div className="brand-icon">
          <Vote size={22} color="#fff" />
        </div>
        <div className="brand-text">
          <h1>CollegeVote</h1>
          <span>Secure Election Portal</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Real-time SignalR Status */}
        <div className="live-pill" title="ASP.NET Core SignalR Live Connection">
          <div className="pulse-dot" style={{ background: isLive ? '#10b981' : '#ef4444' }} />
          <span>{isLive ? 'SignalR Live' : 'Connecting...'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ padding: '8px 12px' }}
        >
          {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
        </button>

        {user && (
          <>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) handleMarkAllRead(); }}
                style={{ padding: '8px 12px', position: 'relative' }}
                title="System Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Drawer */}
              {showNotifs && (
                <div className="notification-dropdown glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                    <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 4 }}>
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Portal Tab switch for Student / Candidate */}
            {user.role !== 'Admin' && user.role !== 'Super Admin' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  className={`btn ${activeTab === 'elections' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setActiveTab('elections')}
                >
                  <Vote size={14} /> Elections
                </button>
                <button 
                  className={`btn ${activeTab === 'candidate' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setActiveTab('candidate')}
                >
                  <Award size={14} /> Candidate View
                </button>
              </div>
            )}

            {/* Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {user.role.includes('Admin') ? <Shield size={16} color="#8b5cf6" /> : <User size={16} color="#6366f1" />}
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName}</span>
              <span className={`badge ${user.role.includes('Admin') ? 'badge-draft' : 'badge-active'}`} style={{ fontSize: '0.65rem' }}>
                {user.role}
              </span>
            </div>

            {/* Logout */}
            <button className="btn btn-secondary" onClick={onLogout} title="Sign Out" style={{ padding: '8px 12px' }}>
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
