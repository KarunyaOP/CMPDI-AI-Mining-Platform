import React, { useState } from 'react';
import { 
  Bell, 
  UploadCloud, 
  Clock, 
  ShieldAlert, 
  ChevronDown, 
  Building2, 
  LogOut
} from 'lucide-react';
import { SUBSIDIARIES, USER_ROLES } from '../data/miningData';

export default function Navbar({ 
  selectedSubsidiary, 
  setSelectedSubsidiary, 
  currentUser, 
  setCurrentUser,
  onOpenUpload,
  onLogout,
  setCurrentPage
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'High Slope Creep Alert - Joyrampur OCP',
      detail: 'Bench 4B displacement exceeded 4.2 mm/day. FOS = 1.18.',
      time: '12 mins ago',
      type: 'high'
    },
    {
      id: 2,
      title: 'Methane Gas Spike - Chinakuri Mine',
      detail: 'In-situ methane concentration reached 14.8 m³/t.',
      time: '45 mins ago',
      type: 'high'
    },
    {
      id: 3,
      title: 'Overburden Dump Radar Warning - Jayant',
      detail: 'Tier-3 terrace settlement at 1.2 mm/day.',
      time: '2 hours ago',
      type: 'med'
    }
  ];

  return (
    <header className="top-navbar">
      {/* Left Section: Subsidiary filter & Clean Shift pill */}
      <div className="navbar-left">
        <div className="org-indicator">
          <Building2 size={16} color="#2563eb" />
          <select 
            className="subsidiary-select"
            value={selectedSubsidiary}
            onChange={(e) => setSelectedSubsidiary(e.target.value)}
            id="subsidiary-select"
            style={{ maxWidth: '210px' }}
          >
            {SUBSIDIARIES.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.code === 'ALL' ? '🏢 All Subsidiaries' : `${sub.code} - ${sub.name}`}
              </option>
            ))}
          </select>
        </div>

        {/* Compact Single-Line Shift Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.74rem',
          color: '#475569',
          whiteSpace: 'nowrap'
        }}>
          <Clock size={13} color="#64748b" />
          <span>Shift-I (06:00 - 14:00) • <strong style={{ color: '#059669' }}>Live</strong></span>
        </div>
      </div>

      {/* Right Section: Actions, Notifications & Profile */}
      <div className="navbar-right">
        {/* Upload Report Button */}
        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenUpload}
          id="btn-nav-upload"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
        >
          <UploadCloud size={15} />
          <span>Upload Report</span>
        </button>

        {/* Risk Alerts Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              position: 'relative'
            }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Real-time Alerts"
            id="btn-notifications"
          >
            <Bell size={16} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#dc2626'
            }} />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: '0',
              width: '320px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 110,
              padding: '14px',
              animation: 'slideUp 0.2s ease-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '10px'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={15} color="#dc2626" />
                  <span>Geo-Hazard Alerts (3)</span>
                </div>
                <span className="badge badge-high">DGMS Monitored</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map(n => (
                  <div 
                    key={n.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: n.type === 'high' ? '#fef2f2' : '#fffbeb',
                      border: `1px solid ${n.type === 'high' ? '#fecaca' : '#fde68a'}`,
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: n.type === 'high' ? '#991b1b' : '#92400e', marginBottom: '2px' }}>
                      {n.title}
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.72rem', marginBottom: '3px' }}>
                      {n.detail}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      {n.time}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '10px', fontSize: '0.75rem' }}
                onClick={() => {
                  setShowNotifications(false);
                  setCurrentPage('coalfield');
                }}
              >
                View on Coalfield Map
              </button>
            </div>
          )}
        </div>

        {/* Role Switcher & User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '4px 10px 4px 6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            id="btn-user-role-dropdown"
          >
            <div className="user-avatar-circle" style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
              {currentUser?.avatar}
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {currentUser?.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: 600 }}>
                {currentUser?.badge}
              </span>
            </div>
            <ChevronDown size={12} color="#64748b" />
          </button>

          {/* Role Switcher Menu */}
          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              top: '44px',
              right: '0',
              width: '240px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 110,
              padding: '10px',
              animation: 'slideUp 0.2s ease-out'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '4px 6px 6px' }}>
                Switch Role Persona
              </div>
              
              {Object.values(USER_ROLES).map((role) => (
                <button
                  key={role.id}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: currentUser?.id === role.id ? '#eff6ff' : 'transparent',
                    color: currentUser?.id === role.id ? '#2563eb' : '#0f172a',
                    fontWeight: currentUser?.id === role.id ? 700 : 500,
                    fontSize: '0.78rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px'
                  }}
                  onClick={() => {
                    setCurrentUser(role);
                    setShowRoleMenu(false);
                  }}
                >
                  <span>{role.badge}</span>
                  {currentUser?.id === role.id && <span style={{ fontSize: '0.68rem' }}>✓</span>}
                </button>
              ))}

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={onLogout}
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
