import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  UploadCloud, 
  Download, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Flame, 
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { SUBSIDIARIES } from '../data/miningData';

export default function ReportsPage({ reports = [], onSelectReport, onOpenUpload, onOpenMineGPT }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubsidiaryFilter, setSelectedSubsidiaryFilter] = useState('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');

  const categories = [
    'ALL',
    'Slope Stability & Geotechnical',
    'Borehole Lithology',
    'Underground Geomechanics',
    'Gas Reservoir & Ventilation',
    'Environmental & Mine Planning'
  ];

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.coalfield.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || report.category === selectedCategory;
    const matchesSubsidiary = selectedSubsidiaryFilter === 'ALL' || report.subsidiary === selectedSubsidiaryFilter;
    const matchesRisk = selectedRiskFilter === 'ALL' || report.riskLevel === selectedRiskFilter;

    return matchesSearch && matchesCategory && matchesSubsidiary && matchesRisk;
  });

  return (
    <div className="page-wrapper">
      {/* Mining Themed Banner */}
      <div 
        className="page-hero-banner"
        style={{
          backgroundImage: 'url(/assets/mining_hero.jpg)',
          padding: '24px 32px'
        }}
      >
        <div className="banner-content">
          <div className="banner-badge">
            <Layers size={12} color="#93c5fd" />
            <span>CMPDI Central Geological Data Repository</span>
          </div>
          <h1 className="banner-title" style={{ fontSize: '1.65rem' }}>
            Reports & Geotechnical Analysis
          </h1>
          <p className="banner-subtitle">
            Browse, search, and drill down into statutory geological reports, borehole logging surveys, and AI-synthesized risk audits across all Coal India subsidiaries.
          </p>
        </div>

        <div className="banner-actions">
          <button 
            className="btn btn-primary"
            onClick={onOpenUpload}
          >
            <UploadCloud size={16} />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '14px' }}>
            {/* Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              <Search size={16} color="#64748b" />
              <input 
                type="text"
                placeholder="Search by report name, coalfield, seam, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem' }}
                id="search-reports-input"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select 
                className="form-input" 
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.filter(c => c !== 'ALL').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Subsidiary Filter */}
            <div>
              <select 
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                value={selectedSubsidiaryFilter}
                onChange={(e) => setSelectedSubsidiaryFilter(e.target.value)}
              >
                <option value="ALL">All Subsidiaries</option>
                <option value="BCCL">BCCL (Dhanbad)</option>
                <option value="ECL">ECL (Sanctoria)</option>
                <option value="CCL">CCL (Ranchi)</option>
                <option value="SECL">SECL (Bilaspur)</option>
                <option value="NCL">NCL (Singrauli)</option>
              </select>
            </div>

            {/* Risk Level Filter */}
            <div>
              <select 
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="High">🔴 High Risk Only</option>
                <option value="Medium">🟡 Medium Risk Only</option>
                <option value="Low">🟢 Low Risk Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-title-group">
            <FileSpreadsheet size={20} color="#2563eb" />
            <div>
              <h3 className="card-title">Geological Reports Library</h3>
              <p className="card-subtitle">Showing {filteredReports.length} indexed documents with AI-ready strata models</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sort by:</span>
            <span className="badge badge-slate" style={{ cursor: 'pointer' }}>Date (Newest First)</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Report ID & Title</th>
                <th>Subsidiary & Basin</th>
                <th>Category</th>
                <th>Date</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        <Layers size={16} />
                      </div>
                      <div>
                        <div 
                          style={{ fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                          onClick={() => onSelectReport(report)}
                        >
                          {report.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          ID: <strong style={{ color: '#2563eb' }}>{report.id}</strong> • File: {report.fileType} ({report.fileSize}) • Author: {report.author}
                        </div>
                        {/* Keyword tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {report.keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', color: '#475569' }}>
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{report.subsidiary}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{report.coalfield}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>
                      {report.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {report.date}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.riskLevel.toLowerCase()}`}>
                      {report.riskLevel} ({report.riskScore}/100)
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                      <CheckCircle2 size={13} color="#059669" />
                      {report.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => onSelectReport(report)}
                        title="Open Detailed Stratigraphic & AI View"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenMineGPT(report.title)}
                        title="Query with MineGPT"
                      >
                        <Sparkles size={13} color="#d97706" />
                      </button>
                    </div>
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
