import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  HardHat, 
  FileText, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Award,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { USER_ROLES } from '../data/miningData';

export default function LoginPage({ onLogin }) {
  const [selectedRoleKey, setSelectedRoleKey] = useState('geologist');
  const [username, setUsername] = useState('sk.mahapatra');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (roleKey) => {
    setSelectedRoleKey(roleKey);
    if (roleKey === 'geologist') setUsername('sk.mahapatra');
    if (roleKey === 'engineer') setUsername('rajesh.sharma');
    if (roleKey === 'reporting_officer') setUsername('pooja.verma');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(USER_ROLES[selectedRoleKey]);
    }, 600);
  };

  return (
    <div 
      className="login-wrapper"
      style={{
        backgroundImage: 'url(/assets/mining_hero.jpg)'
      }}
    >
      <div className="login-overlay" />

      <div className="login-card-container">
        {/* Card Header with CMPDI Crest */}
        <div className="login-card-header">
          {/* Official NIC Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(37, 99, 235, 0.25)',
            border: '1px solid rgba(147, 197, 253, 0.35)',
            color: '#bfdbfe',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} color="#93c5fd" />
            <span>Govt. of India Portal</span>
          </div>

          <div className="login-emblem">
            <Layers size={28} />
          </div>

          <h2 className="login-title">GeoIntel CMPDI</h2>
          <p className="login-subtitle">
            AI-Powered Geological, Mining & Reporting Platform
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            fontSize: '0.72rem',
            color: '#93c5fd',
            background: 'rgba(37, 99, 235, 0.2)',
            padding: '2px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(147, 197, 253, 0.3)'
          }}>
            <Building2 size={12} />
            <span>Coal India Limited & CMPDI Subsidiaries</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="login-body">
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div style={{ marginBottom: '18px' }}>
              <div className="role-selector-label">Select Departmental Role</div>
              <div className="role-grid">
                <div 
                  className={`role-card-btn ${selectedRoleKey === 'geologist' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('geologist')}
                  id="role-btn-geologist"
                >
                  <Sparkles size={20} />
                  <span className="role-card-title">Geologist</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>RI-II Dhanbad</span>
                </div>

                <div 
                  className={`role-card-btn ${selectedRoleKey === 'engineer' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('engineer')}
                  id="role-btn-engineer"
                >
                  <HardHat size={20} />
                  <span className="role-card-title">Mining Eng.</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Slope Stability</span>
                </div>

                <div 
                  className={`role-card-btn ${selectedRoleKey === 'reporting_officer' ? 'active' : ''}`}
                  onClick={() => handleRoleChange('reporting_officer')}
                  id="role-btn-officer"
                >
                  <FileText size={20} />
                  <span className="role-card-title">Reporting Off.</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>CIL HQ MIS</span>
                </div>
              </div>
            </div>

            {/* Selected Profile Highlight */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div className="user-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                {USER_ROLES[selectedRoleKey].avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {USER_ROLES[selectedRoleKey].name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {USER_ROLES[selectedRoleKey].roleTitle} • {USER_ROLES[selectedRoleKey].subsidiary}
                </div>
              </div>
              <CheckCircle2 size={16} color="#059669" />
            </div>

            {/* Form Inputs */}
            <div className="form-group">
              <label className="form-label">NIC / Coal India Username / Email</label>
              <input 
                type="text" 
                className="form-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password / Parichay SSO Token</label>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: '6px' }}
              disabled={isLoading}
              id="btn-login-submit"
            >
              {isLoading ? (
                <span>Authenticating with CMPDI Portal...</span>
              ) : (
                <>
                  <span>Access Geological Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Parichay SSO / Gov badge */}
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '0.72rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} color="#059669" />
              <span>Secured by National Informatics Centre (NIC) • 256-bit Gov Cloud</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
