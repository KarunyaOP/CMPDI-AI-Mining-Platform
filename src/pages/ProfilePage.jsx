import React, { useState } from 'react';
import { 
  UserCheck, 
  Building2, 
  Mail, 
  ShieldCheck, 
  Award, 
  Key, 
  Clock, 
  LogOut, 
  CheckCircle2, 
  Edit3, 
  Save, 
  Sparkles,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { USER_ROLES } from '../data/miningData';

export default function ProfilePage({ currentUser, setCurrentUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [dept, setDept] = useState(currentUser?.department || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    setCurrentUser(prev => ({
      ...prev,
      name,
      email,
      department: dept
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRoleSwitch = (roleKey) => {
    const newRole = USER_ROLES[roleKey];
    setCurrentUser(newRole);
    setName(newRole.name);
    setEmail(newRole.email);
    setDept(newRole.department);
  };

  return (
    <div className="page-wrapper">
      {/* Profile Card Container */}
      <div className="content-card" style={{ overflow: 'hidden' }}>
        {/* Mining Themed Cover Banner */}
        <div 
          className="profile-cover"
          style={{
            backgroundImage: 'url(/assets/mining_hero.jpg)'
          }}
        />

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            <div className="profile-avatar-lg">
              {currentUser?.avatar || 'SM'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                  {name}
                </h2>
                <span className="badge badge-blue">
                  <ShieldCheck size={12} />
                  {currentUser?.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                {dept} • {currentUser?.subsidiary}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEditing ? (
              <button className="btn btn-primary btn-sm" onClick={handleSave}>
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
                <Edit3 size={14} />
                <span>Edit Details</span>
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={onLogout}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Save feedback toast */}
        {saveSuccess && (
          <div style={{
            margin: '16px 32px 0',
            padding: '10px 16px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#065f46',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>Profile information successfully updated in CMPDI Active Directory!</span>
          </div>
        )}

        {/* Details 2-Column Grid */}
        <div className="profile-grid-details">
          {/* Left Column: Official Credentials & Hackathon Role Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Official Credentials Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="#2563eb" />
                <span>Officer Identification & Department Details</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="form-input" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{name}</div>
                  )}
                </div>

                <div>
                  <label className="form-label">Employee Portal ID</label>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                    {currentUser?.empId}
                  </div>
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      className="form-input" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{email}</div>
                  )}
                </div>

                <div>
                  <label className="form-label">Designation</label>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
                    {currentUser?.roleTitle}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Assigned Institute / Subsidiary Division</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="form-input" 
                      value={dept} 
                      onChange={(e) => setDept(e.target.value)} 
                    />
                  ) : (
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{dept}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Role Switcher */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={17} color="#0284c7" />
                  <span>Departmental Role Switcher</span>
                </div>
                <span className="badge badge-blue">Persona Preview</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#0c4a6e', marginBottom: '10px' }}>
                Switch active user persona to view role-tailored capabilities for Geologists, Mining Engineers, and Reporting Officers.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {Object.entries(USER_ROLES).map(([key, role]) => (
                  <button
                    key={key}
                    className={`btn ${currentUser?.id === role.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ justifyContent: 'center' }}
                    onClick={() => handleRoleSwitch(key)}
                  >
                    {role.badge}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Role Permissions & Security Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Authorized Permissions Matrix */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={16} color="#059669" />
                <span>Granted Access Privileges</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentUser?.permissions?.map((perm, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: '#334155'
                    }}
                  >
                    <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0 }} />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory & Security Badges */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Digital Compliance Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569' }}>Digital Signature (e-Sign):</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>✓ Verified (NIC CA)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569' }}>DGMS Authorization:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>✓ Level-3 Clearance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569' }}>e-Office Integration:</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>Active Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
