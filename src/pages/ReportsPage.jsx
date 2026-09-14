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
      <header className="page-header">
        <div><p className="page-kicker">CMPDI central repository</p><h1>Reports &amp; Geotechnical Analysis</h1><p>Review statutory geological reports, borehole logs, and subsidiary risk audits.</p></div>
        <button className="btn btn-primary" type="button" onClick={onOpenUpload}><UploadCloud size={17} /><span>Upload New Report</span></button>
      </header>

      <section className="filter-bar" aria-label="Report filters">
        <label className="report-search" htmlFor="search-reports-input"><Search size={18} /><span className="sr-only">Search reports</span><input id="search-reports-input" type="search" placeholder="Search by report name, coalfield, seam, or keyword" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
        <label className="filter-field"><span>Category</span><select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}><option value="ALL">All Categories</option>{categories.filter((category) => category !== 'ALL').map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label className="filter-field"><span>Subsidiary</span><select value={selectedSubsidiaryFilter} onChange={(event) => setSelectedSubsidiaryFilter(event.target.value)}><option value="ALL">All Subsidiaries</option><option value="BCCL">BCCL</option><option value="ECL">ECL</option><option value="CCL">CCL</option><option value="SECL">SECL</option><option value="NCL">NCL</option></select></label>
        <label className="filter-field"><span>Risk level</span><select value={selectedRiskFilter} onChange={(event) => setSelectedRiskFilter(event.target.value)}><option value="ALL">All Risk Levels</option><option value="High">High Risk</option><option value="Medium">Medium Risk</option><option value="Low">Low Risk</option></select></label>
      </section>

      <section className="content-card reports-library-card">
        <header className="card-header"><div className="card-title-group"><FileSpreadsheet size={20} color="currentColor" /><div><h2 className="card-title">Geological Reports Library</h2><p className="card-subtitle">Showing {filteredReports.length} indexed documents</p></div></div><span className="reports-sort-label">Date: newest first</span></header>
        <div className="table-responsive">
          <table className="gov-table"><thead><tr><th>Report</th><th>Subsidiary</th><th>Category</th><th>Date</th><th>Risk</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {filteredReports.map((report) => <tr key={report.id}>
              <td><div className="report-table-title"><span className="report-file-icon"><Layers size={18} /></span><span><button type="button" className="report-title-link" onClick={() => onSelectReport(report)}>{report.title}</button><small>{report.id} | {report.coalfield} | {report.fileType}</small></span></div></td>
              <td>{report.subsidiary}</td><td>{report.category}</td><td>{report.date}</td>
              <td><span className={`badge badge-${report.riskLevel.toLowerCase()}`}>{report.riskLevel} Risk ({report.riskScore}/100)</span></td>
              <td><span className="report-status">{report.status}</span></td>
              <td><div className="report-actions"><button className="btn btn-primary btn-sm" type="button" onClick={() => onSelectReport(report)}><Eye size={15} /><span>Inspect</span></button><button className="btn btn-secondary btn-sm" type="button" onClick={() => onOpenMineGPT(report.title)} aria-label={`Ask MineGPT about ${report.title}`}><Sparkles size={15} /></button></div></td>
            </tr>)}
          </tbody></table>
        </div>
      </section>
    </div>
  );
}
