import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Activity, 
  ChevronRight, 
  Clock, 
  Download,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Layers,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { KPI_DATA, GEOLOGICAL_REPORTS, COALFIELDS_DATA } from '../data/miningData';

export default function DashboardPage({ 
  currentUser, 
  onOpenUpload, 
  onSelectReport, 
  setCurrentPage,
  onOpenMineGPT,
  selectedSubsidiary 
}) {
  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter reports by subsidiary if selected
  const filteredReports = GEOLOGICAL_REPORTS.filter(r => {
    if (selectedSubsidiary && selectedSubsidiary !== 'all') {
      return r.subsidiary.toLowerCase() === selectedSubsidiary.toLowerCase();
    }
    return true;
  }).filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.coalfield.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeReport = GEOLOGICAL_REPORTS[activeSummaryIndex] || GEOLOGICAL_REPORTS[0];

  return (
    <div className="page-wrapper">
      {/* 1. Large Welcome Banner using Mining Hero Image */}
      <div 
        className="page-hero-banner"
        style={{
          backgroundImage: 'url(/assets/mining_hero.jpg)'
        }}
      >
        <div className="banner-content">
          <div className="banner-badge">
            <Sparkles size={12} color="#93c5fd" />
            <span>AI Geological & Mining Intelligence System</span>
          </div>
          <h1 className="banner-title">
            Geological Intelligence Platform
          </h1>
          <p className="banner-subtitle">
            Centralized AI-driven geological analysis, borehole stratigraphy correlation, slope stability radar monitoring, and automated statutory reporting for CMPDI & CIL subsidiaries.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', fontSize: '0.8rem', color: '#cbd5e1' }}>
            <span>👤 Active Officer: <strong>{currentUser?.name}</strong> ({currentUser?.badge})</span>
            <span>•</span>
            <span>📍 Division: <strong>{currentUser?.subsidiary}</strong></span>
          </div>
        </div>

        <div className="banner-actions">
          <button 
            className="btn btn-outline-light"
            onClick={() => onOpenMineGPT()}
            id="btn-banner-minegpt"
          >
            <Sparkles size={16} color="#f59e0b" />
            <span>Ask MineGPT</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={onOpenUpload}
            id="btn-banner-upload"
          >
            <UploadCloud size={16} />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="kpi-grid">
        {/* Total Reports */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Reports</span>
            <div className="kpi-icon-wrapper">
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div className="kpi-value">{KPI_DATA.totalReports.value}</div>
          <div className="kpi-footer">
            <span className="kpi-change positive">
              <TrendingUp size={14} /> {KPI_DATA.totalReports.change}
            </span>
            <span className="kpi-note">{KPI_DATA.totalReports.note}</span>
          </div>
        </div>

        {/* Active Coalfields */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Coalfields</span>
            <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Compass size={20} />
            </div>
          </div>
          <div className="kpi-value">{KPI_DATA.activeCoalfields.value}</div>
          <div className="kpi-footer">
            <span className="kpi-change neutral">{KPI_DATA.activeCoalfields.change}</span>
            <span className="kpi-note">{KPI_DATA.activeCoalfields.note}</span>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="kpi-card kpi-danger">
          <div className="kpi-header">
            <span className="kpi-title">Risk Alerts</span>
            <div className="kpi-icon-wrapper">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>{KPI_DATA.riskAlerts.value}</div>
          <div className="kpi-footer">
            <span className="kpi-change alert">{KPI_DATA.riskAlerts.change}</span>
            <span className="kpi-note">{KPI_DATA.riskAlerts.note}</span>
          </div>
        </div>

        {/* AI Queries Processed */}
        <div className="kpi-card kpi-success">
          <div className="kpi-header">
            <span className="kpi-title">AI Queries Processed</span>
            <div className="kpi-icon-wrapper">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="kpi-value">{KPI_DATA.aiQueries.value}</div>
          <div className="kpi-footer">
            <span className="kpi-change positive">
              <CheckCircle2 size={14} /> {KPI_DATA.aiQueries.change}
            </span>
            <span className="kpi-note">{KPI_DATA.aiQueries.note}</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Bar */}
      <div className="quick-actions-bar">
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Workflows:
        </span>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenUpload}
        >
          <UploadCloud size={14} color="#2563eb" />
          <span>Upload Report (PDF/DOCX)</span>
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onSelectReport(GEOLOGICAL_REPORTS[0])}
        >
          <Sparkles size={14} color="#059669" />
          <span>Generate AI Summary</span>
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onOpenMineGPT('Show high-risk locations')}
        >
          <ShieldAlert size={14} color="#dc2626" />
          <span>Ask AI: High-Risk Zones</span>
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setCurrentPage('coalfield')}
        >
          <MapPin size={14} color="#0284c7" />
          <span>Open Coalfield Map</span>
        </button>
      </div>

      {/* 4. Main Section: AI Generated Summary Showcase + Upload Dropzone */}
      <div className="dashboard-grid-main">
        {/* Left: AI Generated Summary Showcase */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title-group">
              <Sparkles size={20} color="#2563eb" />
              <div>
                <h3 className="card-title">AI Generated Geological Summary</h3>
                <p className="card-subtitle">Real-time NLP extraction from latest subsidiary geotechnical submissions</p>
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onSelectReport(activeReport)}
            >
              <Eye size={14} />
              <span>Full Analysis</span>
            </button>
          </div>

          {/* Report Switcher Tabs */}
          <div className="summary-selector-tabs">
            {GEOLOGICAL_REPORTS.slice(0, 4).map((rep, idx) => (
              <button
                key={rep.id}
                className={`summary-tab-btn ${activeSummaryIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveSummaryIndex(idx)}
              >
                {rep.subsidiary}: {rep.coalfield.split(' ')[0]} ({rep.riskLevel} Risk)
              </button>
            ))}
          </div>

          <div className="summary-content-body">
            {/* Title & Badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                  {activeReport.title}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {activeReport.subsidiary} • {activeReport.category} • Date: {activeReport.date}
                </div>
              </div>
              <span className={`badge badge-${activeReport.riskLevel.toLowerCase()}`}>
                {activeReport.riskLevel} Risk ({activeReport.riskScore}/100)
              </span>
            </div>

            {/* AI Highlight */}
            <div className="summary-highlight-box">
              {activeReport.executiveSummary}
            </div>

            {/* Key Findings */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                Key Geotechnical Observations:
              </div>
              <ul className="key-insights-list">
                {activeReport.keyFindings.slice(0, 3).map((finding, idx) => (
                  <li key={idx} className="insight-item">
                    <span className="insight-bullet" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Geological Seam & Quality Chips */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginTop: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>CALORIFIC VALUE (GCV)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669' }}>{activeReport.coreLabMetrics?.gcv}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>ASH CONTENT</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{activeReport.coreLabMetrics?.ashContent}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>COAL GRADE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>{activeReport.coreLabMetrics?.cokingIndex}</div>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onSelectReport(activeReport)}
              >
                <span>View Borehole Cross-Section</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Upload Report Dropzone Card */}
        <div className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title-group">
              <UploadCloud size={20} color="#2563eb" />
              <div>
                <h3 className="card-title">Upload Report</h3>
                <p className="card-subtitle">PDF, DOCX, Excel & LAS</p>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div 
              className="upload-dropzone" 
              onClick={onOpenUpload}
              style={{ padding: '24px 16px' }}
            >
              <div className="upload-dropzone-icon">
                <UploadCloud size={26} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  Upload Geological / Mining File
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                  Drag & drop or click to test AI extraction engine
                </div>
              </div>
              <div className="upload-formats">
                <span className="format-chip">PDF</span>
                <span className="format-chip">DOCX</span>
                <span className="format-chip">XLSX</span>
              </div>
            </div>

            {/* Quick stats below upload */}
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Recent Upload Pipeline</span>
                <span className="badge badge-low">All Systems Online</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>OCR Accuracy Rate:</span>
                  <strong style={{ color: '#0f172a' }}>99.4%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Avg. Extraction Latency:</span>
                  <strong style={{ color: '#0f172a' }}>2.8s</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DGMS Compliance Validation:</span>
                  <strong style={{ color: '#059669' }}>Automated</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Secondary Grid: Risk Insights + Coalfield Overview Mini Map */}
      <div className="dashboard-grid-secondary">
        {/* Risk Insights Panel */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title-group">
              <ShieldAlert size={20} color="#dc2626" />
              <div>
                <h3 className="card-title">Risk Insights & Geo-Hazards</h3>
                <p className="card-subtitle">Real-time DGMS threshold monitoring across operational mines</p>
              </div>
            </div>
            <span className="badge badge-high">6 Critical Alerts</span>
          </div>
          <div className="card-body">
            <div className="risk-meter-container">
              {/* High Risk Item */}
              <div className="risk-meter-item" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                <div className="risk-meter-header">
                  <span style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} color="#dc2626" />
                    <strong>Joyrampur OCP (BCCL) - Highwall Slope FOS (1.18)</strong>
                  </span>
                  <span className="badge badge-high">High Risk (84%)</span>
                </div>
                <div className="risk-progress-bar">
                  <div className="risk-progress-fill" style={{ width: '84%', backgroundColor: '#dc2626' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#7f1d1d' }}>
                  Critical shear plane along Seam IX floor. Mandatory bench flattening to 38° required.
                </div>
              </div>

              {/* High Risk Item 2 */}
              <div className="risk-meter-item" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                <div className="risk-meter-header">
                  <span style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={14} color="#dc2626" />
                    <strong>Chinakuri Mine No. 1 (ECL) - Dishergarh Methane Spike</strong>
                  </span>
                  <span className="badge badge-high">High Risk (79%)</span>
                </div>
                <div className="risk-progress-bar">
                  <div className="risk-progress-fill" style={{ width: '79%', backgroundColor: '#dc2626' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#7f1d1d' }}>
                  In-situ gas concentration 14.8 m³/tonne at 610m depth. Vacuum degasification active.
                </div>
              </div>

              {/* Medium Risk Item */}
              <div className="risk-meter-item" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
                <div className="risk-meter-header">
                  <span style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} color="#d97706" />
                    <strong>Jayant Mega OCP (NCL) - Waste Dump Slope Creep (1.2 mm/day)</strong>
                  </span>
                  <span className="badge badge-med">Medium Risk (52%)</span>
                </div>
                <div className="risk-progress-bar">
                  <div className="risk-progress-fill" style={{ width: '52%', backgroundColor: '#d97706' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#78350f' }}>
                  Overburden dump terrace height 135m. Continuous slope radar displacement monitoring.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coalfield Overview Mini Map Preview */}
        <div className="content-card">
          <div className="card-header">
            <div className="card-title-group">
              <MapPin size={20} color="#0284c7" />
              <div>
                <h3 className="card-title">Coalfield GIS Overview</h3>
                <p className="card-subtitle">Active mining blocks & real-time telemetry markers</p>
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage('coalfield')}
            >
              <span>Launch Full GIS Map</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            {/* Interactive Mini Map Visual Card */}
            <div 
              className="mini-map-container"
              style={{
                backgroundImage: 'url(/assets/mining_hero.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentPage('coalfield')}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.2) 100%)'
              }} />

              {/* Minimal Clean Hotspot Pins */}
              <div style={{
                position: 'absolute',
                top: '28%',
                left: '46%',
                zIndex: 2,
                cursor: 'pointer'
              }}>
                <div style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 0 10px rgba(220, 38, 38, 0.8)'
                }}>
                  <span className="pulse-radar" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                  Joyrampur (FOS 1.18)
                </div>
              </div>

              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                zIndex: 2,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '4px 10px',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Compass size={12} color="#38bdf8" />
                <span>Click anywhere to open full GIS workspace</span>
              </div>
            </div>

            {/* Coalfield Quick Jump Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
              {COALFIELDS_DATA.slice(0, 3).map((cf) => (
                <div
                  key={cf.id}
                  style={{
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentPage('coalfield')}
                >
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{cf.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.68rem' }}>{cf.subsidiary} • {cf.totalMines} Mines</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Reports Table */}
      <div className="content-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div className="card-title-group">
            <FileText size={20} color="#2563eb" />
            <div>
              <h3 className="card-title">Recent Geological & Mining Reports</h3>
              <p className="card-subtitle">Validated repository of core logs, slope audits, and environmental submissions</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}>
              <Search size={14} color="#64748b" />
              <input 
                type="text"
                placeholder="Search reports or seams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem' }}
              />
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage('reports')}
            >
              <span>View All Reports</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Report ID & Title</th>
                <th>Subsidiary</th>
                <th>Category</th>
                <th>Date</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <FileText size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{report.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{report.id} • {report.coalfield}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-slate">{report.subsidiary}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{report.category}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{report.date}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.riskLevel.toLowerCase()}`}>
                      {report.riskLevel} ({report.riskScore}/100)
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      <CheckCircle2 size={14} color="#059669" />
                      {report.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectReport(report)}
                      title="Inspect Report"
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
