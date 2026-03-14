export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000';

export const endpoints = {
  login: `${API_BASE}/api/auth/login`,
  register: `${API_BASE}/api/auth/register`,
  predict: `${API_BASE}/api/predict`,
  fertilizer: `${API_BASE}/api/fertilizer`,
  weather: `${API_BASE}/api/weather`,
  health: `${API_BASE}/health`,
};
