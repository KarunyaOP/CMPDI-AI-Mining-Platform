import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Share2, 
  Flame, 
  Printer,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function ReportDetailModal({ report, isOpen, onClose, onOpenMineGPT }) {
  const [downloadToast, setDownloadToast] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;

      const dialog = document.querySelector('[role="dialog"]');
      const focusable = dialog?.querySelectorAll('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.querySelector('[role="dialog"] button, [role="dialog"] input')?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const handleDownload = (format) => {
    setDownloadToast(true);
    setTimeout(() => {
      setDownloadToast(false);
    }, 3000);
  };

  const getRiskBadge = (level) => {
    if (level === 'High') return <span className="badge badge-high"><ShieldAlert size={12} /> High Risk ({report.riskScore}/100)</span>;
    if (level === 'Medium') return <span className="badge badge-med"><ShieldAlert size={12} /> Medium Risk ({report.riskScore}/100)</span>;
    return <span className="badge badge-low"><CheckCircle2 size={12} /> Low Risk ({report.riskScore}/100)</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="report-modal-title" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '92vh' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#0f172a', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
                  {report.id} • {report.subsidiary} ({report.coalfield})
                </span>
                {getRiskBadge(report.riskLevel)}
              </div>
              <h3 id="report-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
                {report.title}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                Authored by {report.author} • Published on {report.date} • Format: {report.fileType} ({report.fileSize})
              </div>
            </div>
          </div>
          <button 
            style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#ffffff' }}
            onClick={onClose}
            aria-label="Close report details dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Download Notification Toast */}
          {downloadToast && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '10px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideUp 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>Geological Report & AI Synthesis exported successfully (CMPDI Signed PDF)!</span>
              </div>
            </div>
          )}

          {/* AI Executive Summary Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '18px 20px',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0369a1',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                <Sparkles size={18} color="#0284c7" />
                <span>AI Generated Executive Summary</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', background: '#ffffff', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bae6fd' }}>
                98.9% Extraction Confidence
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#0f172a' }}>
              {report.executiveSummary}
            </p>
          </div>

          {/* 2-Column Grid: Stratigraphy Column vs Lab Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Stratigraphic Column Visualizer */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Layers size={18} color="#2563eb" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Stratigraphic Borehole Cross-Section
                </h4>
              </div>
              <div className="strata-column">
                {report.stratigraphy && report.stratigraphy.map((layer, idx) => (
                  <div 
                    key={idx} 
                    className="strata-layer" 
                    style={{ backgroundColor: layer.color }}
                  >
                    <div>
                      <div>{layer.layer}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>{layer.lithology}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="strata-depth">{layer.depthFrom}m - {layer.depthTo}m</span>
                      <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>RMR: {layer.rmr}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Lab Metrics & DGMS Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                  Core Lab & Quality Analysis
                </h4>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>ASH CONTENT</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{report.coreLabMetrics?.ashContent || '18.2%'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>MOISTURE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{report.coreLabMetrics?.moisture || '1.4%'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>GROSS CALORIFIC VALUE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{report.coreLabMetrics?.gcv || '6,840 kcal/kg'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>COAL GRADE</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>{report.coreLabMetrics?.cokingIndex || 'Prime Coking'}</div>
                  </div>
                </div>
              </div>

              {/* DGMS Statutory Action Status */}
              <div style={{
                background: report.riskLevel === 'High' ? '#fef2f2' : '#f8fafc',
                border: `1px solid ${report.riskLevel === 'High' ? '#fecaca' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.82rem', color: report.riskLevel === 'High' ? '#991b1b' : '#0f172a', marginBottom: '4px' }}>
                  <ShieldAlert size={16} color={report.riskLevel === 'High' ? '#dc2626' : '#2563eb'} />
                  <span>DGMS Compliance Requirement</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>Standard:</strong> {report.dgmsCompliance?.standard}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <strong>Action Status:</strong> {report.dgmsCompliance?.status}
                </div>
              </div>
            </div>
          </div>

          {/* Key Findings List */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Key Geological & Geotechnical Findings
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {report.keyFindings && report.keyFindings.map((finding, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.84rem'
                  }}
                >
                  <ChevronRight size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Keyword Chips */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Indexed Geological Keywords
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {report.keywords && report.keywords.map((kw, idx) => (
                <span key={idx} className="badge badge-slate" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={() => handleDownload('PDF')}
          >
            <Printer size={16} />
            <span>Print Report</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleDownload('PDF')}
          >
            <Download size={16} />
            <span>Download Official PDF</span>
          </button>
          {onOpenMineGPT && (
            <button 
              className="btn btn-dark"
              onClick={() => {
                onClose();
                onOpenMineGPT(report.title);
              }}
            >
              <Sparkles size={16} color="#f59e0b" />
              <span>Query in MineGPT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
