import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Eye, 
  FileText, 
  Compass, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Info,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  X,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

export default function CoalfieldPage({ onSelectReport, onOpenMineGPT }) {
  const [coalfields, setCoalfields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoalfieldId, setSelectedCoalfieldId] = useState('cf-jharia');
  const [selectedMineType, setSelectedMineType] = useState('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  
  // Panel Visibility States (User can collapse panels to view full-width map)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isFullMapMode, setIsFullMapMode] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  const [activeLayers, setActiveLayers] = useState({
    mines: true,
    boreholes: true,
    radarAlerts: true,
    faultLines: true
  });

  const [selectedObject, setSelectedObject] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    api.getCoalfields().then(data => {
      setCoalfields(data);
      if (data.length > 0) {
        setSelectedObject(data[0].mines[0]);
      }
      setLoading(false);
    });
  }, []);

  const currentCoalfield = coalfields.find(c => c.id === selectedCoalfieldId) || coalfields[0];

  // Helper to trigger Leaflet resize
  const triggerMapResize = () => {
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 350);
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Fix default Leaflet icon paths in case
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: currentCoalfield.center,
        zoom: currentCoalfield.zoom,
        zoomControl: false, // We'll add a nicely positioned zoom control
        attributionControl: false
      });

      // Add top-right zoom control
      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Positron clean GIS tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(currentCoalfield.center, currentCoalfield.zoom);
    }

    triggerMapResize();
  }, [selectedCoalfieldId]);

  // Handle panel toggle effects on map resize
  useEffect(() => {
    triggerMapResize();
  }, [isLeftPanelOpen, isRightPanelOpen, isFullMapMode]);

  // Update map markers whenever coalfield, filters, or layers change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // 1. Add Mine Markers
    if (activeLayers.mines) {
      currentCoalfield.mines.forEach((mine) => {
        if (selectedMineType !== 'ALL') {
          if (selectedMineType === 'OCP' && !mine.type.includes('Opencast')) return;
          if (selectedMineType === 'UG' && !mine.type.includes('Underground')) return;
        }
        if (selectedRiskFilter !== 'ALL' && mine.riskLevel !== selectedRiskFilter) return;

        const isSelected = selectedObject?.id === mine.id;
        const isHighRisk = mine.riskLevel === 'High';
        const isMedRisk = mine.riskLevel === 'Medium';

        const color = isHighRisk ? '#dc2626' : (isMedRisk ? '#d97706' : '#2563eb');
        const iconHtml = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            border-radius: 50%;
            background: ${color};
            color: #ffffff;
            font-size: 13px;
            font-weight: 800;
            box-shadow: 0 4px 12px ${isHighRisk ? 'rgba(220,38,38,0.85)' : 'rgba(0,0,0,0.35)'};
            border: 2.5px solid #ffffff;
            cursor: pointer;
            transition: all 0.2s;
          ">
            ${isHighRisk ? '⚠️' : '⛏️'}
            ${isHighRisk && activeLayers.radarAlerts ? `
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid #dc2626;
                animation: pulseGlow 1.8s infinite;
              "></div>
            ` : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-mine-pin',
          iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
          iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15]
        });

        const marker = L.marker(mine.coordinates, { icon: customIcon });
        marker.on('click', () => {
          setSelectedObject(mine);
          setIsRightPanelOpen(true);
        });
        marker.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <strong>${mine.name}</strong><br/>
            <span style="color: ${color}; font-weight: bold;">Risk: ${mine.riskLevel}</span> | FOS: ${mine.fos}
          </div>
        `, { direction: 'top', offset: [0, -10] });
        marker.addTo(markersGroupRef.current);
      });
    }

    // 2. Add Borehole Markers
    if (activeLayers.boreholes && currentCoalfield.boreholes) {
      currentCoalfield.boreholes.forEach((bh) => {
        const isSelected = selectedObject?.id === bh.id;
        const iconHtml = `
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background: #0f172a;
            color: #38bdf8;
            border-radius: 6px;
            border: 2px solid #38bdf8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            📍
          </div>
        `;

        const bhIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-bh-pin',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker(bh.coordinates, { icon: bhIcon });
        marker.on('click', () => {
          setSelectedObject({ ...bh, isBorehole: true });
          setIsRightPanelOpen(true);
        });
        marker.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <strong>${bh.name}</strong><br/>
            Depth: ${bh.depth}m | Seams: ${bh.seamsEncountered}
          </div>
        `, { direction: 'top', offset: [0, -10] });
        marker.addTo(markersGroupRef.current);
      });
    }
  }, [selectedCoalfieldId, selectedMineType, selectedRiskFilter, activeLayers, selectedObject]);

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const associatedReport = selectedObject?.recentReportId 
    ? GEOLOGICAL_REPORTS.find(r => r.id === selectedObject.recentReportId)
    : GEOLOGICAL_REPORTS[0];

  return (
    <div className="page-wrapper" style={{ paddingBottom: '16px' }}>
      {!isFullMapMode && (
        <div className="page-header">
          <div>
            <p className="page-kicker">GIS spatial telemetry</p>
            <h1>Coalfield Intelligence &amp; GIS Mapping</h1>
            <p>Inspect mine pits, borehole records, radar telemetry, and hazard zones.</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setIsFullMapMode(true)}>
            <Maximize2 size={16} />
            <span>Full Screen Map</span>
          </button>
        </div>
      )}

      {/* Dynamic Grid / Flex Container for Map and Panels */}
      <div style={{
        display: 'flex',
        gap: '14px',
        height: isFullMapMode ? 'calc(100vh - 100px)' : 'calc(100vh - 200px)',
        minHeight: '620px',
        position: 'relative'
      }}>
        
        {/* =========================================================================
            LEFT PANEL: Filters & Layers (Collapsible)
           ========================================================================= */}
        {isLeftPanelOpen && !isFullMapMode && (
          <div style={{
            width: '300px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                <SlidersHorizontal size={16} color="#2563eb" />
                <span>Spatial Controls</span>
              </div>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setIsLeftPanelOpen(false)}
                title="Collapse Filter Panel"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            {/* Coalfield Selector */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Coalfield Basin</label>
              <select 
                className="form-input" 
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
                value={selectedCoalfieldId}
                onChange={(e) => {
                  setSelectedCoalfieldId(e.target.value);
                  const cf = COALFIELDS_DATA.find(c => c.id === e.target.value);
                  if (cf && cf.mines.length > 0) setSelectedObject(cf.mines[0]);
                }}
              >
                {COALFIELDS_DATA.map((cf) => (
                  <option key={cf.id} value={cf.id}>
                    {cf.name} ({cf.subsidiary})
                  </option>
                ))}
              </select>
            </div>

            {/* Mine Type Filter */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Excavation Type</label>
              <select 
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
                value={selectedMineType}
                onChange={(e) => setSelectedMineType(e.target.value)}
              >
                <option value="ALL">All Mine Types (OCP & UG)</option>
                <option value="OCP">Opencast (OCP) Only</option>
                <option value="UG">Underground (UG) Only</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Hazard Level</label>
              <select 
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="High">🔴 High Risk (FOS &lt; 1.30)</option>
                <option value="Medium">🟡 Medium Risk</option>
                <option value="Low">🟢 Low Risk (Stable)</option>
              </select>
            </div>

            {/* Layer Toggles */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Map Layers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="layer-toggle-row">
                  <span>⛏️ Active Mines ({currentCoalfield.mines.length})</span>
                  <input type="checkbox" checked={activeLayers.mines} onChange={() => toggleLayer('mines')} />
                </label>
                <label className="layer-toggle-row">
                  <span>📍 Borehole Coring Logs</span>
                  <input type="checkbox" checked={activeLayers.boreholes} onChange={() => toggleLayer('boreholes')} />
                </label>
                <label className="layer-toggle-row">
                  <span>⚠️ Radar Hazard Rings</span>
                  <input type="checkbox" checked={activeLayers.radarAlerts} onChange={() => toggleLayer('radarAlerts')} />
                </label>
                <label className="layer-toggle-row">
                  <span>⚡ Fault Line Traces</span>
                  <input type="checkbox" checked={activeLayers.faultLines} onChange={() => toggleLayer('faultLines')} />
                </label>
              </div>
            </div>

            {/* Coalfield Quick Stats */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.75rem',
              color: '#475569',
              marginTop: 'auto'
            }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{currentCoalfield.name}</div>
              <div>Reserves: <strong>{currentCoalfield.reservesMT}</strong></div>
              <div>Formations: {currentCoalfield.primeSeams}</div>
              <div style={{ color: '#dc2626', marginTop: '4px', fontSize: '0.72rem' }}>⚠️ {currentCoalfield.riskSummary}</div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CENTER: High-Performance Leaflet GIS Map Viewport
           ========================================================================= */}
        <div style={{
          flex: 1,
          background: '#0b1324',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Top Floating Map Toolbar */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}>
            {/* Toggle Left Filter Button */}
            {!isFullMapMode && (
              <button 
                style={{
                  background: isLeftPanelOpen ? 'rgba(255,255,255,0.1)' : '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
                onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                title="Toggle Left Filter Panel"
              >
                {isLeftPanelOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                <span>{isLeftPanelOpen ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
            )}

            {/* Coalfield Quick Switcher in Toolbar */}
            <select 
              value={selectedCoalfieldId}
              onChange={(e) => {
                setSelectedCoalfieldId(e.target.value);
                const cf = COALFIELDS_DATA.find(c => c.id === e.target.value);
                if (cf && cf.mines.length > 0) setSelectedObject(cf.mines[0]);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {COALFIELDS_DATA.map((cf) => (
                <option key={cf.id} value={cf.id} style={{ background: '#0f172a', color: '#ffffff' }}>
                  📍 {cf.name}
                </option>
              ))}
            </select>

            {/* Quick Layer Toggles Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <button
                style={{
                  background: activeLayers.mines ? '#2563eb' : 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => toggleLayer('mines')}
              >
                ⛏️ Mines
              </button>

              <button
                style={{
                  background: activeLayers.boreholes ? '#0284c7' : 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => toggleLayer('boreholes')}
              >
                📍 Boreholes
              </button>

              <button
                style={{
                  background: activeLayers.radarAlerts ? '#dc2626' : 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => toggleLayer('radarAlerts')}
              >
                ⚠️ Radar
              </button>
            </div>

            {/* Toggle Full Screen / Normal Mode */}
            <button 
              style={{
                background: isFullMapMode ? '#059669' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#ffffff',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginLeft: 'auto'
              }}
              onClick={() => setIsFullMapMode(!isFullMapMode)}
              title="Toggle Full Map Mode"
            >
              {isFullMapMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isFullMapMode ? 'Exit Full View' : 'Max View'}</span>
            </button>

            {/* Toggle Right Details Panel Button */}
            {!isFullMapMode && (
              <button 
                style={{
                  background: isRightPanelOpen ? 'rgba(255,255,255,0.1)' : '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                title="Toggle Right Details Panel"
              >
                {isRightPanelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                <span>{isRightPanelOpen ? 'Hide Details' : 'Show Details'}</span>
              </button>
            )}
          </div>

          {/* Leaflet Map DOM Canvas */}
          <div 
            ref={mapContainerRef} 
            style={{ 
              width: '100%', 
              height: '100%',
              zIndex: 1
            }} 
          />

          {/* Compact Collapsible Map Legend (Bottom Right) */}
          {showLegend && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              zIndex: 400,
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a', marginBottom: '2px', gap: '8px' }}>
                <span>Legend</span>
                <button 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: '#64748b' }}
                  onClick={() => setShowLegend(false)}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
                <span>High Risk (FOS &lt; 1.30)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
                <span>Operational / Stable Pit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '2px' }} />
                <span>Deep Borehole Log</span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            RIGHT PANEL: Selected Object Telemetry & Details (Collapsible)
           ========================================================================= */}
        {isRightPanelOpen && !isFullMapMode && (
          <div style={{
            width: '320px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {selectedObject ? (
              <div>
                {/* Header with Close */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <span className="badge badge-blue" style={{ marginBottom: '4px' }}>
                      {selectedObject.isBorehole ? 'Borehole Exploration' : selectedObject.type}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                      {selectedObject.name}
                    </h3>
                  </div>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    onClick={() => setIsRightPanelOpen(false)}
                    title="Close Details Panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Risk Tag */}
                {selectedObject.riskLevel && (
                  <div style={{ marginBottom: '10px' }}>
                    <span className={`badge badge-${selectedObject.riskLevel.toLowerCase()}`}>
                      {selectedObject.riskLevel} Risk Alert
                    </span>
                  </div>
                )}

                {/* Coordinates */}
                <div style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#64748b',
                  background: '#f8fafc',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '12px'
                }}>
                  Lat: {selectedObject.coordinates?.[0]?.toFixed(4)}° N, Long: {selectedObject.coordinates?.[1]?.toFixed(4)}° E
                </div>

                {/* Key Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>FACTOR OF SAFETY (FOS)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: (selectedObject.fos < 1.3 ? '#dc2626' : '#059669') }}>
                      {selectedObject.fos || '1.75 (Safe)'}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>TARGET COAL SEAM</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedObject.seamTarget || selectedObject.topSeam || 'Seam IX/X'}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>DEPTH</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedObject.depthM || selectedObject.depth || '240'} meters
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>STRIPPING RATIO</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563eb' }}>
                      {selectedObject.strippingRatio || '1:4.2'}
                    </div>
                  </div>
                </div>

                {/* Sensor Telemetry Box (If mine) */}
                {selectedObject.sensorTelemetry && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.75rem', color: '#0369a1', marginBottom: '6px' }}>
                      <Activity size={14} color="#0284c7" />
                      <span>Live Ground Telemetry Sensors</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', fontSize: '0.72rem' }}>
                      <div>Vibration: <strong>{selectedObject.sensorTelemetry.vibrationMmSec} mm/s</strong></div>
                      <div>Tilt: <strong>{selectedObject.sensorTelemetry.tiltDegree}°</strong></div>
                      <div>Pore Pressure: <strong>{selectedObject.sensorTelemetry.porePressureKpa} kPa</strong></div>
                      <div>Water Table: <strong>{selectedObject.sensorTelemetry.waterTableDepthM}m</strong></div>
                    </div>
                  </div>
                )}

                {/* Geological Hazard Reason */}
                {selectedObject.riskReason && (
                  <div style={{
                    background: selectedObject.riskLevel === 'High' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${selectedObject.riskLevel === 'High' ? '#fecaca' : '#fde68a'}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.75rem',
                    color: selectedObject.riskLevel === 'High' ? '#991b1b' : '#92400e',
                    marginBottom: '12px'
                  }}>
                    <strong>AI Hazard Diagnosis:</strong> {selectedObject.riskReason}
                  </div>
                )}

                {/* Linked Geological Report */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  background: '#ffffff'
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Latest Geological Audit
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    {associatedReport.title}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: '0.72rem' }}
                      onClick={() => onSelectReport(associatedReport)}
                    >
                      <Eye size={12} />
                      <span>Inspect Strata</span>
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => onOpenMineGPT(associatedReport.title)}
                    >
                      Ask AI
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                <MapPin size={28} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.8rem' }}>Click any mine marker or borehole on the map to inspect telemetry.</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
