import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = '#6366f1', subtitle }) {
  return (
    <div className="stat-card glass-panel">
      <div className="stat-icon" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon size={26} color={color} />
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{subtitle}</span>}
      </div>
    </div>
  );
}
