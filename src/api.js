// ResumeForge API client
// ------------------------------------------------------------------
// IMPORTANT: set REACT_APP_API_BASE to your InfinityFree API base URL
// before building. If you are using CRA locally you can put it in a
// .env file:  REACT_APP_API_BASE=https://your-domain.epizy.com/api
// Otherwise this defaults to the value below.
// ------------------------------------------------------------------

const API_BASE = (process.env.REACT_APP_API_BASE || 'https://your-domain.epizy.com/api').replace(/\/$/, '');

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const err = new Error('Could not reach the server. Check your internet connection.');
    err.network = true;
    throw err;
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`Server error (HTTP ${res.status}).`);
  }

  if (!res.ok || !json.ok) {
    const err = new Error(json.error || `Server error (HTTP ${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const api = {
  loadResume: (deviceId) => request(`/resume.php?deviceId=${encodeURIComponent(deviceId)}`),
  saveResume: (deviceId, data) => request('/resume.php', { method: 'PUT', body: { deviceId, data } }),
  recordDownload: (deviceId, data) =>
    request('/resume.php?action=download', { method: 'POST', body: { deviceId, data } }),
  adminLogin: (username, password) =>
    request('/admin.php?action=login', { method: 'POST', body: { username, password } }),
  adminStats: (token) => request('/admin.php?action=stats', { token }),
  adminListResumes: (token) => request('/admin.php?action=resumes', { token }),
  adminLogout: (token) => request('/admin.php?action=logout', { method: 'POST', token }),
};
