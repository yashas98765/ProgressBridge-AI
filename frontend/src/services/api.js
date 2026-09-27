const API_BASE = '/api';

function buildQuery(params = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== 'undefined') {
      clean[k] = v;
    }
  }
  const q = new URLSearchParams(clean).toString();
  return q ? `?${q}` : '';
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // Projects & Dashboard
  async getDashboard() {
    const res = await fetch(`${API_BASE}/dashboard`);
    return res.json();
  },

  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  // Schedule
  async getSchedule(params = {}) {
    const res = await fetch(`${API_BASE}/schedule${buildQuery(params)}`);
    return res.json();
  },

  async updateSchedule(activityId, data) {
    const res = await fetch(`${API_BASE}/schedule/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Documents & Ingestion
  async uploadDocument(formData) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async loadSampleDocument(type) {
    const res = await fetch(`${API_BASE}/documents/sample/${type}`, {
      method: 'POST'
    });
    return res.json();
  },

  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },

  // Progress Events
  async getProgressEvents(params = {}) {
    const res = await fetch(`${API_BASE}/progress/events${buildQuery(params)}`);
    return res.json();
  },

  async extractText(text) {
    const res = await fetch(`${API_BASE}/progress/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  // Matches
  async getMatches(params = {}) {
    const res = await fetch(`${API_BASE}/matches${buildQuery(params)}`);
    return res.json();
  },

  async approveMatch(matchId, data = {}) {
    const res = await fetch(`${API_BASE}/matches/${matchId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async rejectMatch(matchId, data = {}) {
    const res = await fetch(`${API_BASE}/matches/${matchId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async changeMatch(matchId, data) {
    const res = await fetch(`${API_BASE}/matches/${matchId}/change`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Direct AI Match
  async testAIMatch(actualDescription, discipline) {
    const res = await fetch(`${API_BASE}/ai/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualDescription, discipline })
    });
    return res.json();
  },

  // Time Agent
  async sendTimeAgentMessage(data) {
    const res = await fetch(`${API_BASE}/time-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics & Delay
  async getDelayAnalytics(params = {}) {
    const res = await fetch(`${API_BASE}/analytics/delays${buildQuery(params)}`);
    return res.json();
  },

  // Project Memory
  async getProjectMemory(params = {}) {
    const res = await fetch(`${API_BASE}/project-memory${buildQuery(params)}`);
    return res.json();
  },

  // Audit
  async getAuditLogs(params = {}) {
    const res = await fetch(`${API_BASE}/audit${buildQuery(params)}`);
    return res.json();
  },

  // Demo Reset
  async resetDemo() {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST'
    });
    return res.json();
  }
};
