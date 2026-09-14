import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  MapPin, 
  Bot, 
  UserCheck, 
  Layers, 
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, currentUser, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'reports', label: 'Reports & Analysis', icon: FileSpreadsheet, badge: '6 New' },
    { id: 'coalfield', label: 'Coalfield Intelligence', icon: MapPin, badge: 'GIS' },
    { id: 'minegpt', label: 'MineGPT Assistant', icon: Bot, badge: 'AI' },
    { id: 'profile', label: 'Officer Profile', icon: UserCheck, badge: null }
  ];

  return (
    <aside className="sidebar-container">
      <div>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <Layers size={22} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">GeoIntel CMPDI</span>
            <span className="sidebar-brand-subtitle">Ministry of Coal • CIL</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Core Modules</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
                id={`nav-${item.id}`}
              >
                <div className="sidebar-item-left">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '999px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <span className="sidebar-section-label" style={{ marginTop: '16px' }}>System Telemetry</span>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '8px',
            padding: '10px 12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: '#94a3b8' }}>AI NLP Engine:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: '#94a3b8' }}>GIS Telemetry:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Synced</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: '#94a3b8' }}>DGMS Compliance:</span>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>Active Audit</span>
            </div>
          </div>
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="sidebar-footer">
        <div 
          className="sidebar-user-card"
          onClick={() => setCurrentPage('profile')}
          title="Click to view Profile"
        >
          <div className="user-avatar-circle">
            {currentUser?.avatar || 'SM'}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-role-tag">{currentUser?.badge}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
