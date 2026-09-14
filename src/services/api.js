const API_BASE = '/api';

export const api = {
  getCoalfields: async () => {
    const res = await fetch(`${API_BASE}/coalfields`);
    return res.json();
  },
  getKPIs: async () => {
    const res = await fetch(`${API_BASE}/dashboard/kpis`);
    return res.json();
  },
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports?${query}`);
    return res.json();
  },
  getReportDetail: async (id) => {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    return res.json();
  },
  queryMineGPT: async (query, contextReportId = null) => {
    const res = await fetch(`${API_BASE}/minegpt/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context_report_id: contextReportId })
    });
    return res.json();
  },
  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

