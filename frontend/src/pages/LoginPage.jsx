import React, { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, FileText, HardHat, Layers, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { USER_ROLES } from '../data/miningData';
import { api } from '../services/api';

const roles = [
  { key: 'geologist', label: 'Senior Geologist', detail: 'RI-II Dhanbad', icon: Sparkles },
  { key: 'engineer', label: 'Mining Engineer', detail: 'Pit and slope safety', icon: HardHat },
  { key: 'reporting_officer', label: 'Reporting Officer', detail: 'CIL HQ MIS', icon: FileText }
];

export default function LoginPage({ onLogin }) {
  const [selectedRoleKey, setSelectedRoleKey] = useState('geologist');
  const [username, setUsername] = useState('sk.mahapatra');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleRoleChange = (roleKey) => {
    setSelectedRoleKey(roleKey);
    setLoginError('');
    const usernames = { geologist: 'sk.mahapatra', engineer: 'rajesh.sharma', reporting_officer: 'pooja.verma' };
    setUsername(usernames[roleKey]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await api.login({
        username,
        password,
        role_key: selectedRoleKey,
      });

      const user = response.user || USER_ROLES[selectedRoleKey];
      onLogin(user);
    } catch (err) {
      // Fallback to local USER_ROLES data if API is unreachable (offline/dev mode)
      if (!err.status) {
        console.warn('API unreachable, falling back to local user data:', err.message);
        onLogin(USER_ROLES[selectedRoleKey]);
      } else {
        setLoginError(err.message || 'Login failed. Please try again.');
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="login-wrapper">
      <div className="login-overlay" />
      <section className="login-card-container" aria-labelledby="login-title">
        <header className="login-card-header">
          <div className="login-emblem"><Layers size={28} /></div>
          <h1 id="login-title" className="login-title">GeoIntel</h1>
          <p className="login-subtitle">Geological reporting and coalfield intelligence for CMPDI officers</p>
          <p className="login-organisation"><Building2 size={15} /> Coal India Limited and CMPDI subsidiaries</p>
        </header>

        <div className="login-body">
          <form onSubmit={handleSubmit}>
            <fieldset className="login-role-section">
              <legend className="role-selector-label">Select your role</legend>
              <div className="role-grid">
                {roles.map(({ key, label, detail, icon: Icon }) => (
                  <button
                    type="button"
                    className={`role-card-btn ${selectedRoleKey === key ? 'active' : ''}`}
                    key={key}
                    id={`role-btn-${key}`}
                    aria-pressed={selectedRoleKey === key}
                    onClick={() => handleRoleChange(key)}
                  >
                    <Icon size={22} />
                    <span className="role-card-title">{label}</span>
                    <span className="role-card-detail">{detail}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="login-selected-profile">
              <span className="login-selected-avatar">{USER_ROLES[selectedRoleKey].avatar}</span>
              <span className="login-selected-copy"><strong>{USER_ROLES[selectedRoleKey].name}</strong><span>{USER_ROLES[selectedRoleKey].roleTitle}</span></span>
              <CheckCircle2 size={18} className="text-success" />
            </div>

            {loginError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#991b1b',
                marginBottom: '12px',
                fontWeight: 600
              }}>
                <AlertTriangle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="login-username">NIC / Coal India username or email</label>
              <input id="login-username" type="text" className="form-input" value={username} onChange={(event) => setUsername(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password / Parichay SSO token</label>
              <input id="login-password" type="password" className="form-input" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-submit-button" disabled={isLoading} id="btn-login-submit">
              <span>{isLoading ? 'Signing in...' : 'Sign in to dashboard'}</span>
              {!isLoading && <ArrowRight size={18} />}
            </button>
            <p className="login-security-note"><ShieldCheck size={16} /> Secured government officer access</p>
          </form>
        </div>
      </section>
    </main>
  );
}
