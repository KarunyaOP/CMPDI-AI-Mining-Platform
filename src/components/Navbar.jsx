import React, { useState } from 'react';
import { Building2, ChevronDown, LogOut, Menu } from 'lucide-react';
import { SUBSIDIARIES, USER_ROLES } from '../data/miningData';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  reports: 'Reports',
  'recent-reports': 'Recent Reports',
  about: 'About GeoIntel',
  coalfield: 'Coalfield',
  minegpt: 'MineGPT',
  profile: 'Profile'
};

export default function Navbar({
  currentPage,
  selectedSubsidiary,
  setSelectedSubsidiary,
  currentUser,
  setCurrentUser,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
  setCurrentPage
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const pageTitle = PAGE_TITLES[currentPage] || 'Dashboard';

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="sidebar-menu-button"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
        >
          <Menu size={22} />
        </button>
        <button
          type="button"
          className="dashboard-home-button"
          onClick={() => setCurrentPage('dashboard')}
          aria-label="Open main dashboard"
          title="Open main dashboard"
        >
          <Building2 size={19} />
        </button>
        <h1 className="navbar-page-title">{pageTitle}</h1>
      </div>

      <div className="navbar-center">
        <label className="navbar-subsidiary-label" htmlFor="subsidiary-select">Subsidiary</label>
        <select
          className="subsidiary-select"
          value={selectedSubsidiary}
          onChange={(event) => setSelectedSubsidiary(event.target.value)}
          id="subsidiary-select"
        >
          {SUBSIDIARIES.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.code === 'ALL' ? 'All Subsidiaries' : `${sub.code} - ${sub.name}`}
            </option>
          ))}
        </select>
      </div>

      <div className="navbar-right">
        <div className="profile-menu-wrapper">
          <button
            type="button"
            className="navbar-profile-button"
            onClick={() => setShowRoleMenu((isOpen) => !isOpen)}
            aria-label="Open profile menu"
            aria-expanded={showRoleMenu}
            id="btn-user-role-dropdown"
          >
            <span className="navbar-avatar">{currentUser?.avatar}</span>
            <span className="navbar-profile-copy">
              <strong>{currentUser?.name}</strong>
              <span>{currentUser?.badge}</span>
            </span>
            <ChevronDown size={16} />
          </button>

          {showRoleMenu && (
            <div className="navbar-role-menu">
              <p className="navbar-role-menu-title">Switch role</p>
              {Object.values(USER_ROLES).map((role) => (
                <button
                  type="button"
                  className={`navbar-role-option ${currentUser?.id === role.id ? 'active' : ''}`}
                  key={role.id}
                  onClick={() => {
                    setCurrentUser(role);
                    setShowRoleMenu(false);
                    setCurrentPage('dashboard');
                  }}
                >
                  <span>{role.badge}</span>
                  {currentUser?.id === role.id && <span aria-label="Selected">Selected</span>}
                </button>
              ))}
              <button type="button" className="navbar-logout-button" onClick={onLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
