import React from 'react';
import { ArrowLeft, Eye, FileText, MapPin, ShieldAlert } from 'lucide-react';
import { COALFIELDS_DATA, GEOLOGICAL_REPORTS } from '../data/miningData';

export default function RecentReportsPage({ onSelectReport, onOpenCoalfield }) {
  const getCoalfield = (report) => COALFIELDS_DATA.find((coalfield) => (
    coalfield.subsidiary === report.subsidiary ||
    report.coalfield.toLowerCase().includes(coalfield.name.split(' ')[0].toLowerCase())
  )) || COALFIELDS_DATA[0];

  return (
    <div className="page-wrapper recent-reports-page">
      <div className="page-heading-row">
        <div>
          <p className="page-kicker">CMPDI report repository</p>
          <h1 className="page-heading">Recent Reports</h1>
          <p className="page-heading-description">
            Review the latest geological, mining, and geotechnical submissions with their associated coalfield locations.
          </p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => window.history.back()}>
          <ArrowLeft size={17} />
          <span>Back</span>
        </button>
      </div>

      <div className="recent-report-grid">
        {GEOLOGICAL_REPORTS.map((report) => {
          const coalfield = getCoalfield(report);
          return (
            <article className="recent-report-card" key={report.id}>
              <div className="recent-report-card-header">
                <div className="recent-report-icon"><FileText size={20} /></div>
                <div>
                  <p className="recent-report-id">{report.id} | {report.date}</p>
                  <h2>{report.title}</h2>
                </div>
              </div>

              <div className="recent-report-meta">
                <span>{report.subsidiary}</span>
                <span>{report.category}</span>
                <span className={`badge badge-${report.riskLevel.toLowerCase()}`}>
                  <ShieldAlert size={14} /> {report.riskLevel} Risk
                </span>
              </div>

              <div className="report-map-preview" aria-label={`Map location preview for ${coalfield.name}`}>
                <div className="report-map-grid" />
                <div className="report-map-surface">
                  <span className="report-map-contour contour-one" />
                  <span className="report-map-contour contour-two" />
                  <span className="report-map-contour contour-three" />
                  <span className="report-map-pin"><MapPin size={18} /></span>
                </div>
                <div className="report-map-label">{coalfield.name} | {coalfield.state}</div>
              </div>

              <div className="recent-report-actions">
                <button className="btn btn-primary btn-sm" type="button" onClick={() => onSelectReport(report)}>
                  <Eye size={15} />
                  <span>Inspect Report</span>
                </button>
                <button className="btn btn-secondary btn-sm" type="button" onClick={onOpenCoalfield}>
                  <MapPin size={15} />
                  <span>Open Coalfield Map</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
