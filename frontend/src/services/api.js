const API_BASE = '/api';

/**
 * Centralized fetch wrapper that throws on non-2xx responses
 * and always returns parsed JSON. Surfaces HTTP status codes
 * so callers can differentiate 401 / 404 / 500 etc.
 */
async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        (data && (data.detail || data.message)) ||
        `Request failed (${res.status})`;
      const error = new Error(message);
      error.status = res.status;
      error.body = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Re-throw our own errors (already structured above)
    if (err.status) throw err;

    // Network / CORS / timeout — wrap into a friendly error
    const wrapped = new Error(
      'Network error — please check your connection and try again.'
    );
    wrapped.original = err;
    throw wrapped;
  }
}

export const api = {
  /**
   * POST /api/auth/login  – authenticate with username, password & role_key.
   * Returns { access_token, token_type, user }.
   */
  login: async ({ username, password, role_key }) => {
    return request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role_key }),
    });
  },

  /**
   * GET /api/coalfields  – all coalfields with mines & boreholes.
   */
  getCoalfields: async (subsidiary = 'all') => {
    return request(`${API_BASE}/coalfields?subsidiary=${encodeURIComponent(subsidiary)}`);
  },

  /**
   * GET /api/dashboard/kpis  – dashboard KPI metrics.
   */
  getKPIs: async (subsidiary = 'all') => {
    return request(`${API_BASE}/dashboard/kpis?subsidiary=${encodeURIComponent(subsidiary)}`);
  },

  /**
   * GET /api/reports  – list reports with optional filters.
   */
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`${API_BASE}/reports${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/reports/:id  – full stratigraphic & AI detail for one report.
   */
  getReportDetail: async (id) => {
    return request(`${API_BASE}/reports/${encodeURIComponent(id)}`);
  },

  /**
   * POST /api/reports/upload  – upload a geological report file.
   * @param {File} file       – the actual File object
   * @param {string} subsidiary  – e.g. "BCCL"
   * @param {string} category    – e.g. "Slope Stability & Geotechnical"
   */
  uploadReport: async (file, subsidiary = 'BCCL', category = 'Slope Stability & Geotechnical') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subsidiary', subsidiary);
    formData.append('category', category);

    return request(`${API_BASE}/reports/upload`, {
      method: 'POST',
      body: formData,
      // NOTE: do NOT set Content-Type header — the browser must
      // set it to multipart/form-data with the correct boundary.
    });
  },

  /**
   * POST /api/minegpt/query  – natural-language MineGPT Q&A.
   */
  queryMineGPT: async (query, contextReportId = null) => {
    return request(`${API_BASE}/minegpt/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context_report_id: contextReportId }),
    });
  },

  /**
   * PUT /api/profile  – update officer profile.
   */
  updateProfile: async (data) => {
    return request(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
