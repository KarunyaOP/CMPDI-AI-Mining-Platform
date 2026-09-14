import React, { useEffect, useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight,
  Database,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadComplete, onOpenMineGPT }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState('idle'); // idle | processing | completed
  const [processingStatus, setProcessingStatus] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState(null);

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

  if (!isOpen) return null;

  const sampleDemoFiles = [
    { name: 'Joyrampur_Block_IV_Geotechnical_Audit.pdf', size: '14.2 MB', category: 'Slope Stability & Geotechnical', subsidiary: 'BCCL' },
    { name: 'Raniganj_Dishergarh_Seam_Coring_Logs.docx', size: '8.6 MB', category: 'Borehole Lithology', subsidiary: 'ECL' },
    { name: 'Korba_Gevra_70MTPA_Hydrogeology_Report.xlsx', size: '12.4 MB', category: 'Hydrogeology & Mine Plan', subsidiary: 'SECL' }
  ];

  const handleStartProcessing = (fileInfo) => {
    setSelectedFile(fileInfo);
    setStage('processing');
    setUploadProgress(10);
    setProcessingStatus('Uploading and encrypting document to CMPDI Secure Cloud...');

    setTimeout(() => {
      setUploadProgress(35);
      setProcessingStatus('Running OCR & Stratigraphic Table Parsing...');
    }, 900);

    setTimeout(() => {
      setUploadProgress(65);
      setProcessingStatus('Extracting Coal Seams, Factor of Safety (FOS), and RMR Metrics...');
    }, 1800);

    setTimeout(() => {
      setUploadProgress(90);
      setProcessingStatus('Synthesizing AI Geological Executive Summary...');
    }, 2600);

    setTimeout(() => {
      setUploadProgress(100);
      setStage('completed');
      setGeneratedSummary({
        title: fileInfo.name.replace(/_/g, ' ').replace(/\.[^/.]+$/, ''),
        subsidiary: fileInfo.subsidiary || 'BCCL',
        category: fileInfo.category || 'Geotechnical Audit',
        seam: 'Seam IX/X (Prime Coking)',
        fos: '1.18 (Critical Slope Alert)',
        ash: '18.2%',
        gcv: '6,840 kcal/kg',
        riskLevel: 'High',
        summary: 'AI Extraction Complete: South-West highwall bench exhibits planar shear risk along carbonaceous shale interface. Immediate 8-hole sub-horizontal dewatering and bench flattening to 38° recommended under DGMS S&T guidelines.'
      });
    }, 3400);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStage('idle');
    setUploadProgress(0);
    setGeneratedSummary(null);
  };

  const handleCommitReport = () => {
    if (generatedSummary) {
      onUploadComplete(generatedSummary);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 id="upload-modal-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Upload Mining & Geological Report
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                AI-Powered OCR, Seam Extraction & Summary Engine
              </p>
            </div>
          </div>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            onClick={onClose}
            aria-label="Close upload report dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {stage === 'idle' && (
            <div>
              {/* Drag Drop Area */}
              <button 
                type="button"
                className="upload-dropzone"
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const f = e.dataTransfer.files[0];
                    handleStartProcessing({
                      name: f.name,
                      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                      category: 'Geological Analysis',
                      subsidiary: 'BCCL'
                    });
                  }
                }}
                onClick={() => {
                  // Trigger sample
                  handleStartProcessing(sampleDemoFiles[0]);
                }}
              >
                <div className="upload-dropzone-icon">
                  <UploadCloud size={28} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    Drag and drop your report here, or <span style={{ color: '#2563eb', textDecoration: 'underline' }}>browse file</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    Supports Geological PDF, Exploration DOCX, Core Borehole Excel (XLSX), & LAS files (Max 100MB)
                  </div>
                </div>

                <div className="upload-formats">
                  <span className="format-chip">📄 PDF</span>
                  <span className="format-chip">📝 DOCX</span>
                  <span className="format-chip">📊 XLSX</span>
                  <span className="format-chip">⛏️ LAS Logs</span>
                </div>
              </button>

              {/* Instant One-Click Sample Geological Reports */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Or select a verified sample report to test:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sampleDemoFiles.map((file, idx) => (
                    <button
                      type="button"
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleStartProcessing(file)}
                      aria-label={`Run AI analysis for ${file.name}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#2563eb" />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{file.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{file.subsidiary} • {file.category} • {file.size}</div>
                        </div>
                      </div>
                      <span className="btn btn-secondary btn-sm" style={{ fontSize: '0.875rem' }}>
                        Run AI Analysis
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stage === 'processing' && (
            <div style={{ padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                <Loader2 size={64} color="#2563eb" style={{ animation: 'spin 1.5s linear infinite' }} />
                <Sparkles size={24} color="#f59e0b" style={{ position: 'absolute', top: '20px', left: '20px' }} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  AI Ingestion & Geological Extraction in Progress
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {processingStatus}
                </p>
              </div>

              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)', 
                      width: `${uploadProgress}%`, 
                      transition: 'width 0.4s ease-out' 
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                  <span>{selectedFile?.name}</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {stage === 'completed' && generatedSummary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={20} color="#059669" />
                <div style={{ fontSize: '0.84rem', color: '#065f46', fontWeight: 600 }}>
                  Report Successfully Processed and Indexed into CMPDI Knowledge Base!
                </div>
              </div>

              {/* Extracted Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Target Seam</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{generatedSummary.seam}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Factor of Safety</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>{generatedSummary.fos}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Calorific Value</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{generatedSummary.gcv}</div>
                </div>
              </div>

              {/* AI Summary Highlight */}
              <div style={{
                background: '#f0f9ff',
                borderLeft: '4px solid #0284c7',
                padding: '14px 16px',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.85rem',
                color: '#0c4a6e',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#0284c7" />
                  <span>AI Executive Extraction</span>
                </div>
                {generatedSummary.summary}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {stage === 'completed' ? (
            <>
              <button className="btn btn-secondary" onClick={handleReset}>
                Upload Another
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleCommitReport();
                  if (onOpenMineGPT) onOpenMineGPT();
                }}
              >
                <span>Ask MineGPT About This Report</span>
                <ArrowRight size={16} />
              </button>
              <button className="btn btn-dark" onClick={handleCommitReport}>
                Save to Reports Library
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
