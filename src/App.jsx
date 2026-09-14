import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import CoalfieldPage from './pages/CoalfieldPage';
import MineGPTPage from './pages/MineGPTPage';
import ProfilePage from './pages/ProfilePage';
import UploadModal from './components/UploadModal';
import ReportDetailModal from './components/ReportDetailModal';
import { USER_ROLES, GEOLOGICAL_REPORTS } from './data/miningData';
import './App.css';

export default function App() {
  // Navigation & User State
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to logged in for immediate demo, with easy logout
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(USER_ROLES.geologist);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState('all');

  // Modals & Popups State
  const [reports, setReports] = useState(GEOLOGICAL_REPORTS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [minegptPrompt, setMinegptPrompt] = useState('');

  // Handle Login
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  // Trigger MineGPT with pre-filled question
  const handleOpenMineGPT = (promptText = '') => {
    setMinegptPrompt(promptText);
    setCurrentPage('minegpt');
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
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <Navbar 
          selectedSubsidiary={selectedSubsidiary}
          setSelectedSubsidiary={setSelectedSubsidiary}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onOpenUpload={() => setIsUploadOpen(true)}
          onLogout={handleLogout}
          setCurrentPage={setCurrentPage}
        />

        {/* Dynamic Page Rendering */}
        <main>
          {currentPage === 'dashboard' && (
            <DashboardPage 
              currentUser={currentUser}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectReport={(report) => setSelectedReport(report)}
              setCurrentPage={setCurrentPage}
              onOpenMineGPT={handleOpenMineGPT}
              selectedSubsidiary={selectedSubsidiary}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsPage 
              reports={reports}
              onSelectReport={(report) => setSelectedReport(report)}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenMineGPT={handleOpenMineGPT}
            />
          )}

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
