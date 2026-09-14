import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Bot, 
  Layers, 
  MapPin, 
  ArrowRight,
  FileText,
  BarChart3,
  Clock,
  Activity,
  AlertTriangle,
  Zap,
  Target,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({ onSelectReport, onNavigateToCoalfields }) {
  const [kpis, setKpis] = useState(null);
  const [reports, setReports] = useState([]);
  const [coalfields, setCoalfields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getKPIs(),
      api.getReports(),
      api.getCoalfields()
    ]).then(([kpiData, reportData, coalfieldData]) => {
      setKpis(kpiData);
      setReports(reportData);
      setCoalfields(coalfieldData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div className="page-hero-banner" style={{ backgroundImage: 'url(/assets/mining_hero.jpg)' }}>
        <div className="banner-content">
          <div className="banner-badge">
            <Layers size={12} color="#93c5fd" />
            <span>CMPDI AI Geological Intelligence Center</span>
          </div>
          <h1 className="banner-title">
            GeoIntel Mining Command Center
          </h1>
          <p className="banner-subtitle">
            Executive monitoring dashboard for statutory geological reporting, coal seam stratigraphy, and AI-powered hazard diagnostics across all Coal India subsidiaries.
          </p>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Total Reports */}
        <div className="content-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#2563eb', opacity: 0.1 }}>
            <Layers size={48} />
          </div>
          <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
            <div className="card-subtitle" style={{ marginBottom: '4px' }}>Total Indexed Reports</div>
            <div className="kpi-value">{kpis.totalReports.value}</div>
            <div className="kpi-meta">
              <TrendingUp size={14} color="#059669" />
              <span>{kpis.totalReports.change}</span>
            </div>
            <div className="kpi-note">{kpis.totalReports.note}</div>
          </div>
        </div>

        {/* Active Coalfields */}
        <div className="content-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#d97706', opacity: 0.1 }}>
            <MapPin size={48} />
          </div>
          <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
            <div className="card-subtitle" style={{ marginBottom: '4px' }}>Active Coalfield Basins</div>
            <div className="kpi-value">{kpis.activeCoalfields.value}</div>
            <div className="kpi-meta">
              <span>{kpis.activeCoalfields.change}</span>
            </div>
            <div className="kpi-note">{kpis.activeCoalfields.note}</div>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="content-card" style={{ position: 'relative', overflow: 'hidden', borderLeft: '4px solid #dc2626' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#dc2626', opacity: 0.1 }}>
            <ShieldAlert size={48} />
          </div>
          <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
            <div className="card-subtitle" style={{ marginBottom: '4px' }}>DGMS Risk Alerts</div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>{kpis.riskAlerts.value}</div>
            <div className="kpi-meta">
              <AlertTriangle size={14} color="#dc2626" />
              <span>{kpis.riskAlerts.change}</span>
            </div>
            <div className="kpi-note">{kpis.riskAlerts.note}</div>
          </div>
        </div>

        {/* AI Queries */}
        <div className="content-card" style={{ position: 'relative', overflow: 'hidden', borderLeft: '4px solid #2563eb' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#2563eb', opacity: 0.1 }}>
            <Bot size={48} />
          </div>
          <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
            <div className="card-subtitle" style={{ marginBottom: '4px' }}>MineGPT AI Extractions</div>
            <div className="kpi-value">{kpis.aiQueries.value}</div>
            <div className="kpi-meta">
              <CheckCircle2 size={14} color="#059669" />
              <span>{kpis.aiQueries.change}</span>
            </div>
            <div className="kpi-note">{kpis.aiQueries.note}</div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="content-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title-group">
            <FileText size={20} color="#2563eb" />
            <div>
              <h3 className="card-title">Latest Geological Audits</h3>
              <p className="card-subtitle">Recently uploaded and AI-analyzed statutory reports</p>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Report ID & Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Risk</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 5).map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{report.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{report.id} • {report.fileType}</div>
                  </td>
                  <td><span className="badge badge-blue">{report.category}</span></td>
                  <td>{report.date}</td>
                  <td><span className={`badge badge-${report.riskLevel.toLowerCase()}`}>{report.riskLevel}</span></td>
                  <td>{report.status}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => onSelectReport(report)}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coalfield Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {coalfields.slice(0, 3).map((cf) => (
          <div key={cf.id} className="content-card" style={{ cursor: 'pointer' }} onClick={onNavigateToCoalfields}>
            <div className="card-header" style={{ padding: '16px' }}>
              <div className="card-title-group">
                <MapPin size={20} color="#2563eb" />
                <div>
                  <h3 className="card-title">{cf.name}</h3>
                  <p className="card-subtitle">{cf.subsidiary}</p>
                </div>
              </div>
              <ArrowRight size={16} color="#64748b" />
            </div>
            <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div className="card-subtitle">Active Mines</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{cf.activePits}</div>
              </div>
              <div>
                <div className="card-subtitle">Reserves</div>
                <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{cf.reservesMT}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
