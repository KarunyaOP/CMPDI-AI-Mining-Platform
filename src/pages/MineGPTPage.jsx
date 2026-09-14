import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  FileText, 
  Database, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function MineGPTPage() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    api.getReports().then(reports => setRecentReports(reports.slice(0, 3)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await api.queryMineGPT(query);
      const aiMessage = {
        role: 'ai',
        title: response.responseTitle,
        content: response.reply,
        sources: response.sources
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Error querying geological knowledge base.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>
      
      {/* Chat Interface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="content-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div className="card-title-group">
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <h3 className="card-title">MineGPT AI Assistant</h3>
                <p className="card-subtitle">CMPDI Central Geological Knowledge Engine</p>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
            {chatHistory.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '400px' }}>
                <Bot size={48} color="#2563eb" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Welcome to MineGPT</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Ask questions about coal seam stratigraphy, slope stability, or statutory DGMS guidelines.
                </p>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '12px', alignItems: 'flex-start' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="#fff" />
                  </div>
                )}
                <div style={{ maxWidth: '70%', background: msg.role === 'user' ? '#2563eb' : '#fff', color: msg.role === 'user' ? '#fff' : '#0f172a', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {msg.title && (
                    <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#d97706" /> {msg.title}
                    </div>
                  )}
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  
                  {msg.sources && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.72rem', color: '#64748b' }}>
                      <strong>Sources:</strong>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {msg.sources.map((src, j) => (
                          <span key={j} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {src.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={16} color="#fff" className="animate-spin" />
                </div>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  Analyzing geological corpus...
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask MineGPT..."
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar: Suggested Queries & Recent Reports */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="content-card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>Suggested Queries</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Summarize the uploaded report', 'Show high-risk locations'].map((q, i) => (
              <button key={i} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => { setQuery(q); }}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="content-card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>Recent Reports</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentReports.map(r => (
              <div key={r.id} style={{ fontSize: '0.78rem', color: '#475569', padding: '8px', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer' }} onClick={() => { setQuery(`Summarize ${r.title}`); }}>
                {r.title.substring(0, 40)}...
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
