import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  MapPin, 
  Bot, 
  UserCheck, 
  Layers,
  UploadCloud,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, currentUser, isCollapsed, onOpenUpload, onGenerateSummary }) {
  const commonItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'minegpt', label: 'MineGPT', icon: Bot },
    { id: 'profile', label: 'Profile', icon: UserCheck }
  ];
  const roleItems = currentUser?.id === 'geologist'
    ? [commonItems[0], { id: 'reports', label: 'Reports', icon: FileSpreadsheet }, { id: 'coalfield', label: 'Coalfield', icon: MapPin }, commonItems[1], commonItems[2]]
    : currentUser?.id === 'engineer'
      ? [commonItems[0], commonItems[1], { id: 'coalfield', label: 'Coalfield', icon: MapPin }, commonItems[2]]
      : [commonItems[0], { id: 'reports', label: 'Reports', icon: FileSpreadsheet }, commonItems[1], commonItems[2]];

  return (
    <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <Layers size={22} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">GeoIntel</span>
            <span className="sidebar-brand-subtitle">Ministry of Coal • CIL</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="sidebar-workflows">
            <span className="sidebar-section-label">Quick Workflows</span>
            <button className="sidebar-workflow-button" type="button" onClick={onOpenUpload}>
              <UploadCloud size={17} />
              <span>Upload Report</span>
            </button>
            <button className="sidebar-workflow-button" type="button" onClick={onGenerateSummary}>
              <Sparkles size={17} />
              <span>Generate AI Summary</span>
            </button>
            <button className="sidebar-workflow-button" type="button" onClick={() => setCurrentPage('coalfield')}>
              <MapPin size={17} />
              <span>Open Coalfield Map</span>
            </button>
          </div>

          <span className="sidebar-section-label sidebar-core-heading">Core Modules</span>
          {roleItems.map((item) => {
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
              </button>
            );
          })}

        </nav>
      </div>

      {/* User Footer Card */}
      <div className="sidebar-footer">
        <button 
          className="sidebar-user-card"
          onClick={() => setCurrentPage('profile')}
          aria-label="Open Profile"
        >
          <div className="user-avatar-circle">
            {currentUser?.avatar || 'SM'}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-role-tag">{currentUser?.badge}</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
