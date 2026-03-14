export const CUD_BASE = import.meta.env.VITE_CUD_BASE ?? 'http://localhost:5000';
export const GQL_BASE = import.meta.env.VITE_GQL_BASE ?? 'http://localhost:5001';

export const endpoints = {
  login:      `${CUD_BASE}/api/auth/login`,
  register:   `${CUD_BASE}/api/auth/register`,
  predict:    `${CUD_BASE}/api/predict`,
  fertilizer: `${CUD_BASE}/api/fertilizer`,
  weather:    `${CUD_BASE}/api/weather`,
  health_cud: `${CUD_BASE}/health`,
  graphql:    `${GQL_BASE}/graphql`,
  health_gql: `${GQL_BASE}/health`,
};
