import React from 'react';
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MapPin,
  ShieldAlert,
  Target,
  TrendingUp,
  UploadCloud
} from 'lucide-react';
import { GEOLOGICAL_REPORTS } from '../data/miningData';

const roleCopy = {
  geologist: {
    title: 'Geological Exploration & Analysis Desk',
    subtitle: 'Borehole, seam stratigraphy, laboratory, and hazard annotation work queue.',
    action: 'Upload Exploration Report'
  },
  engineer: {
    title: 'Production & Pit Safety Command Center',
    subtitle: 'Production achievement, pit stability, equipment, and safety monitoring.',
    action: 'Open Safety Register'
  },
  reporting_officer: {
    title: 'Compliance & Approvals Workspace',
    subtitle: 'Statutory filings, Ministry MIS, approvals, and subsidiary risk oversight.',
    action: 'Review Sign-offs'
  }
};

function MetricCard({ label, value, detail, tone = 'blue' }) {
  return (
    <article className={`role-metric-card role-metric-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section className={`role-panel ${className}`}>
      <header className="role-panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>
      <div className="role-panel-body">{children}</div>
    </section>
  );
}

function StatusBadge({ children, tone = 'blue' }) {
  return <span className={`role-status role-status-${tone}`}>{children}</span>;
}

function GeologistDashboard({ onSelectReport, setCurrentPage }) {
  return (
    <>
      <div className="role-metric-grid">
        <MetricCard label="Active Boreholes" value="38" detail="12 awaiting logging" />
        <MetricCard label="Metres Drilled (MTD)" value="4,820 m" detail="92% of monthly plan" tone="green" />
        <MetricCard label="Pending Lab Results" value="14" detail="6 results ready" tone="amber" />
        <MetricCard label="AI Summaries Generated" value="126" detail="18 drafts need review" />
      </div>

      <div className="role-dashboard-grid">
        <Panel title="Exploration Activity" subtitle="Current drillhole work queue" className="role-panel-large">
          <div className="role-table-wrap">
            <table className="role-table">
              <thead><tr><th>Hole ID</th><th>Coalfield</th><th>Depth</th><th>Stage</th><th>Progress</th></tr></thead>
              <tbody>
                <tr><td>BH-JH-104</td><td>Jharia</td><td>380 m</td><td><StatusBadge>Logging</StatusBadge></td><td><progress value="72" max="100">72%</progress></td></tr>
                <tr><td>BH-JH-109</td><td>Jharia</td><td>420 m</td><td><StatusBadge tone="amber">Lab</StatusBadge></td><td><progress value="84" max="100">84%</progress></td></tr>
                <tr><td>BH-RN-204</td><td>Raniganj</td><td>260 m</td><td><StatusBadge tone="green">Complete</StatusBadge></td><td><progress value="100" max="100">100%</progress></td></tr>
              </tbody>
            </table>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => setCurrentPage('reports')}><FileText size={16} /> View Reports Repository</button>
        </Panel>

        <Panel title="Lab Results Queue" subtitle="Sample quality results requiring attention">
          <div className="role-list">
            <div className="role-list-row"><span>BH-JH-109 core samples</span><StatusBadge tone="amber">Results ready</StatusBadge></div>
            <div className="role-list-row"><span>Korba seam assay batch 04</span><StatusBadge>In laboratory</StatusBadge></div>
            <div className="role-list-row"><span>Raniganj moisture analysis</span><StatusBadge tone="green">Completed</StatusBadge></div>
          </div>
          <div className="role-mini-bars"><span className="role-mini-bar role-mini-bar-one" /><span className="role-mini-bar role-mini-bar-two" /><span className="role-mini-bar role-mini-bar-three" /></div>
        </Panel>

        <Panel title="Stratigraphy Quick View" subtitle="Selected borehole: BH-JH-104">
          <div className="role-strata-preview"><span className="strata-sandstone">Sandstone 0-52 m</span><span className="strata-coal">Coal seam 52-78 m</span><span className="strata-shale">Shale 78-96 m</span></div>
          <button className="btn btn-secondary" type="button" onClick={() => onSelectReport(GEOLOGICAL_REPORTS[0])}>View Borehole Details</button>
        </Panel>

        <Panel title="Hazard Annotation Queue" subtitle="DGMS annotations pending review">
          <div className="role-list">
            <div className="role-list-row"><span>Joyrampur highwall displacement</span><StatusBadge tone="red">High Risk</StatusBadge></div>
            <div className="role-list-row"><span>Chinakuri methane observation</span><StatusBadge tone="amber">Medium Risk</StatusBadge></div>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => setCurrentPage('coalfield')}><MapPin size={16} /> Open Coalfield Map</button>
        </Panel>
      </div>
    </>
  );
}

function EngineerDashboard({ setCurrentPage }) {
  return (
    <>
      <div className="role-metric-grid">
        <MetricCard label="Coal Production (MTD)" value="86.4%" detail="Target 1.20 MT | Actual 1.04 MT" tone="green" />
        <MetricCard label="Stripping Ratio" value="1:4.2" detail="Plan 1:4.5" />
        <MetricCard label="HEMM Utilisation" value="78%" detail="34 deployed | 5 idle" tone="amber" />
        <MetricCard label="Safety Alerts Active" value="6" detail="2 critical alerts" tone="red" />
      </div>

      <div className="role-dashboard-grid">
        <Panel title="Production Achievement" subtitle="Month-to-date output against approved target" className="role-panel-large">
          <div className="role-table-wrap"><table className="role-table"><thead><tr><th>Mine</th><th>Target (MT)</th><th>Actual (MT)</th><th>Achieved</th></tr></thead><tbody><tr><td>Joyrampur OCP</td><td>420,000</td><td>391,000</td><td><StatusBadge tone="green">93%</StatusBadge></td></tr><tr><td>Gevra Expansion</td><td>510,000</td><td>436,000</td><td><StatusBadge tone="amber">85%</StatusBadge></td></tr><tr><td>Chinakuri UG</td><td>270,000</td><td>213,000</td><td><StatusBadge tone="red">79%</StatusBadge></td></tr></tbody></table></div>
          <button className="btn btn-secondary" type="button" onClick={() => setCurrentPage('coalfield')}><MapPin size={16} /> Inspect Pit Conditions</button>
        </Panel>

        <Panel title="Pit & Bench Stability" subtitle="Active bench condition rating">
          <div className="role-list"><div className="role-list-row"><span>Joyrampur Bench 4B</span><StatusBadge tone="red">Critical</StatusBadge></div><div className="role-list-row"><span>Kusunda East Bench</span><StatusBadge tone="amber">Watch</StatusBadge></div><div className="role-list-row"><span>Gevra North Block</span><StatusBadge tone="green">Stable</StatusBadge></div></div>
        </Panel>

        <Panel title="HEMM Fleet Board" subtitle="Current equipment availability"><div className="fleet-strip"><strong>34 <span>Deployed</span></strong><strong>5 <span>Idle</span></strong><strong className="text-risk">2 <span>Breakdown</span></strong></div><button className="btn btn-secondary" type="button">View Fleet Register</button></Panel>

        <Panel title="Blasting Register" subtitle="Upcoming operations and vibration readings"><div className="role-list"><div className="role-list-row"><span>Gevra South Block | 14:30</span><StatusBadge tone="green">Within threshold</StatusBadge></div><div className="role-list-row"><span>Jayant Tier 3 | Tomorrow</span><StatusBadge tone="red">Review required</StatusBadge></div></div></Panel>
      </div>
    </>
  );
}

function ReportingOfficerDashboard({ setCurrentPage, onSelectReport }) {
  return (
    <>
      <div className="role-metric-grid">
        <MetricCard label="Pending Approvals" value="12" detail="4 due today" tone="amber" />
        <MetricCard label="DGMS Filings Due" value="5" detail="Next deadline: 18 Mar" tone="red" />
        <MetricCard label="MIS Submissions Overdue" value="2" detail="Action required" tone="red" />
        <MetricCard label="Subsidiary High-Risk Count" value="6" detail="Across 4 subsidiaries" tone="red" />
      </div>

      <div className="role-dashboard-grid">
        <Panel title="Pending Your Sign-off" subtitle="Documents awaiting official action" className="role-panel-large"><div className="role-list"><div className="role-list-row role-list-action"><span>Joyrampur Executive Summary | BCCL</span><span className="role-action-group"><StatusBadge tone="red">Due today</StatusBadge><button className="btn btn-primary btn-sm" type="button" onClick={() => onSelectReport(GEOLOGICAL_REPORTS[0])}>View</button></span></div><div className="role-list-row role-list-action"><span>Quarterly MIS Submission | ECL</span><span className="role-action-group"><StatusBadge tone="amber">Due in 2 days</StatusBadge><button className="btn btn-primary btn-sm" type="button">Review</button></span></div><div className="role-list-row role-list-action"><span>Environmental Audit Memo | SECL</span><span className="role-action-group"><StatusBadge>Due in 5 days</StatusBadge><button className="btn btn-primary btn-sm" type="button">Review</button></span></div></div></Panel>

        <Panel title="Statutory Calendar" subtitle="DGMS compliance milestones"><div className="calendar-list"><div><strong>18 Mar</strong><span>DGMS slope audit filing</span></div><div><strong>31 Mar</strong><span>Quarterly Ministry MIS</span></div><div><strong>05 Apr</strong><span>Environmental audit register</span></div></div></Panel>

        <Panel title="MIS Tracker" subtitle="Quarterly Ministry of Coal submissions"><div className="role-list"><div className="role-list-row"><span>BCCL Q4 MIS</span><StatusBadge tone="green">Acknowledged</StatusBadge></div><div className="role-list-row"><span>ECL Q4 MIS</span><StatusBadge>Submitted</StatusBadge></div><div className="role-list-row"><span>SECL Q4 MIS</span><StatusBadge tone="amber">Draft</StatusBadge></div></div></Panel>

        <Panel title="Subsidiary Risk Register" subtitle="Current roll-up by severity"><div className="risk-register"><strong>High Risk <span className="text-risk">6</span></strong><strong>Medium Risk <span className="text-warning">11</span></strong><strong>Low Risk <span className="text-success">28</span></strong></div><button className="btn btn-secondary" type="button" onClick={() => setCurrentPage('reports')}><FileText size={16} /> Open Reports Register</button></Panel>
      </div>
    </>
  );
}

export default function RoleDashboardPage({ currentUser, onOpenUpload, onSelectReport, setCurrentPage }) {
  const role = currentUser?.id || 'geologist';
  const copy = roleCopy[role] || roleCopy.geologist;
  const DashboardContent = role === 'engineer' ? EngineerDashboard : role === 'reporting_officer' ? ReportingOfficerDashboard : GeologistDashboard;

  return (
    <div className="page-wrapper role-dashboard-page">
      <header className="page-header">
        <div><p className="page-kicker">CMPDI officer workspace</p><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
        <button className="btn btn-primary" type="button" onClick={role === 'geologist' ? onOpenUpload : () => setCurrentPage(role === 'engineer' ? 'coalfield' : 'reports')}><UploadCloud size={17} /><span>{copy.action}</span></button>
      </header>
      <DashboardContent onSelectReport={onSelectReport} onOpenUpload={onOpenUpload} setCurrentPage={setCurrentPage} />
      <section className="about-intelligence-section" aria-labelledby="about-intelligence-title">
        <div className="about-intelligence-heading">
          <p className="page-kicker">About GeoIntel</p>
          <h2 id="about-intelligence-title">One workspace for CMPDI officers</h2>
          <p>Explore duties, responsibilities, and workflows.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => setCurrentPage('about')}><FileText size={16} /><span>About GeoIntel</span></button>
      </section>
    </div>
  );
}
