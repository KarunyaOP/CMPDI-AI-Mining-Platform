import React, { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, FileText, HardHat, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { USER_ROLES } from '../data/miningData';

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

  const handleRoleChange = (roleKey) => {
    setSelectedRoleKey(roleKey);
    const usernames = { geologist: 'sk.mahapatra', engineer: 'rajesh.sharma', reporting_officer: 'pooja.verma' };
    setUsername(usernames[roleKey]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => onLogin(USER_ROLES[selectedRoleKey]), 600);
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
