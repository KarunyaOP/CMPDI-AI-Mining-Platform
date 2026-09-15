import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import RecentReportsPage from './pages/RecentReportsPage';
import CoalfieldPage from './pages/CoalfieldPage';
import MineGPTPage from './pages/MineGPTPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import UploadModal from './components/UploadModal';
import ReportDetailModal from './components/ReportDetailModal';
import { USER_ROLES, GEOLOGICAL_REPORTS } from './data/miningData';
import './App.css';

export default function App() {
  const savedSession = (() => {
    try {
      return JSON.parse(localStorage.getItem('cmpdi_session') || 'null');
    } catch {
      return null;
    }
  })();

  // Navigation & User State
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(savedSession?.isLoggedIn));
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(
    USER_ROLES[savedSession?.roleKey] || USER_ROLES.geologist
  );
  const [selectedSubsidiary, setSelectedSubsidiary] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals & Popups State
  const [reports, setReports] = useState(GEOLOGICAL_REPORTS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [minegptPrompt, setMinegptPrompt] = useState('');

  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      window.history.replaceState({}, '', '/');
      localStorage.setItem('cmpdi_session', JSON.stringify({
        isLoggedIn: true,
        roleKey: currentUser.id
      }));
    }
  }, [isLoggedIn, currentUser]);

  // Handle Login
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    localStorage.setItem('cmpdi_session', JSON.stringify({
      isLoggedIn: true,
      roleKey: user.id
    }));
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('cmpdi_session');
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  // Trigger MineGPT with pre-filled question
  const handleOpenMineGPT = (promptText = '') => {
    setMinegptPrompt(promptText);
    setCurrentPage('minegpt');
  };

  const handleOpenAbout = () => {
    window.history.pushState({}, '', '/about');
    setCurrentPage('about');
  };

  // Handle Upload Complete
  const handleUploadComplete = (newReport) => {
    const reportWithId = {
      ...newReport,
      id: `REP-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      author: currentUser.name,
      status: 'AI Analyzed & Certified',
      riskScore: Math.floor(Math.random() * 100),
      coalfield: 'Integrated Coalfield',
      fileType: 'PDF',
      fileSize: '12.5 MB',
      executiveSummary: newReport.summary,
      keywords: ['AI Extracted', 'New Report', 'Statutory'],
      stratigraphy: GEOLOGICAL_REPORTS[0].stratigraphy,
      keyFindings: [newReport.summary, 'Automatic risk assessment completed.'],
      coreLabMetrics: GEOLOGICAL_REPORTS[0].coreLabMetrics,
      dgmsCompliance: { standard: 'DGMS Standard', status: 'Compliant', deadline: 'N/A' }
    };
    setReports(prev => [reportWithId, ...prev]);
  };

  // If not logged in, render the Login Page
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Dark Sidebar */}
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((isCollapsed) => !isCollapsed)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onGenerateSummary={() => setSelectedReport(GEOLOGICAL_REPORTS[0])}
      />

      {/* Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Navbar */}
        <Navbar 
          selectedSubsidiary={selectedSubsidiary}
          setSelectedSubsidiary={setSelectedSubsidiary}
          currentPage={currentPage}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((isCollapsed) => !isCollapsed)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onLogout={handleLogout}
          setCurrentPage={setCurrentPage}
        />

        {/* Dynamic Page Rendering */}
        <main id="main-content" tabIndex="-1">
          {currentPage === 'dashboard' && (
            <DashboardPage 
              currentUser={currentUser}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectReport={(report) => setSelectedReport(report)}
              setCurrentPage={setCurrentPage}
              onOpenMineGPT={handleOpenMineGPT}
              onOpenAbout={handleOpenAbout}
              selectedSubsidiary={selectedSubsidiary}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsPage 
              onSelectReport={(report) => setSelectedReport(report)}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenMineGPT={handleOpenMineGPT}
            />
          )}

          {currentPage === 'recent-reports' && (
            <RecentReportsPage
              onSelectReport={(report) => setSelectedReport(report)}
              onOpenCoalfield={() => setCurrentPage('coalfield')}
            />
          )}

          {currentPage === 'about' && <AboutPage />}

          {currentPage === 'coalfield' && (
            <CoalfieldPage 
              onSelectReport={(report) => setSelectedReport(report)}
              onOpenMineGPT={handleOpenMineGPT}
            />
          )}

          {currentPage === 'minegpt' && (
            <MineGPTPage 
              initialPrompt={minegptPrompt}
              onSelectReport={(report) => setSelectedReport(report)}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage 
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Upload Report Modal */}
      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
        onOpenMineGPT={() => {
          setIsUploadOpen(false);
          handleOpenMineGPT('Summarize the uploaded report');
        }}
      />

      {/* Report Detailed Stratigraphic & AI Drilldown Modal */}
      <ReportDetailModal 
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onOpenMineGPT={(reportTitle) => {
          setSelectedReport(null);
          handleOpenMineGPT(`Provide detailed geotechnical summary for ${reportTitle}`);
        }}
      />
    </div>
  );
}
