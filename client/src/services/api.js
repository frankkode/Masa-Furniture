import axios from 'axios';

/* ── generate a persistent session key for guest cart tracking ── */
let sessionKey = localStorage.getItem('masa_session_key');
if (!sessionKey) {
  sessionKey = crypto.randomUUID ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('masa_session_key', sessionKey);
}

// In dev Vite proxies /api → localhost:5000.
// In production Express serves both the API and the React build
// from the same origin, so '/api' works everywhere.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/* attach token + session key on every request */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-session-key'] = localStorage.getItem('masa_session_key') || sessionKey;
  return config;
});

/* redirect to login on 401 */
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
