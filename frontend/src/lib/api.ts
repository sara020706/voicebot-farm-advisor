const CUD_BASE = import.meta.env.VITE_CUD_BASE ?? 'http://localhost:5000';
const GQL_BASE = import.meta.env.VITE_GQL_BASE ?? 'http://localhost:5001';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('vb_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${CUD_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    throw new Error('Invalid credentials');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export async function apiRegister(data: { name: string; email: string; password: string; state?: string; acres?: number }) {
  const res = await fetch(`${CUD_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    throw new Error('Registration failed');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export async function apiPredict(data: { N: number; P: number; K: number; pH: number; temperature: number; humidity: number; rainfall: number }) {
  const res = await fetch(`${CUD_BASE}/api/predict`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export async function apiFertilizer(data: { N: number; P: number; K: number; crop: string }) {
  const res = await fetch(`${CUD_BASE}/api/fertilizer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export async function apiWeather(city: string) {
  const res = await fetch(`${CUD_BASE}/api/weather?city=${encodeURIComponent(city)}`, {
    headers: authHeaders()
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export async function apiHistory() {
  const res = await fetch(`${CUD_BASE}/api/history`, {
    headers: authHeaders()
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export async function apiSchemes(crop?: string, state?: string) {
  const params = new URLSearchParams();
  if (crop) params.append('crop', crop);
  if (state) params.append('state', state);
  const url = `${CUD_BASE}/api/schemes${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url, {
    headers: authHeaders()
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export async function gqlQuery(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(`${GQL_BASE}/graphql`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ query, variables })
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
}

export async function queryMyScans(limit = 10) {
  return gqlQuery(`
    query MyScans($limit: Int) {
      myScans(limit: $limit) {
        id recommendedCrop confidence n p k ph
        temperature humidity rainfall createdAt
      }
    }
  `, { limit });
}

export async function querySchemes(crop?: string, state?: string) {
  return gqlQuery(`
    query Schemes($crop: String, $state: String) {
      schemes(crop: $crop, state: $state) {
        id name type description benefit link
      }
    }
  `, { crop, state });
}

export async function queryMe() {
  return gqlQuery(`
    query Me {
      me { id name email state acres createdAt }
    }
  `);
}



export async function apiYield(crop: string) {
  const res = await fetch(`${CUD_BASE}/api/yield?crop=${encodeURIComponent(crop)}`, {
    headers: authHeaders()
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Failed to fetch yield data');
  }
  return res.json();
}

export async function apiPests(crop: string) {
  const res = await fetch(`${CUD_BASE}/api/pests?crop=${encodeURIComponent(crop)}`, {
    headers: authHeaders()
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Failed to fetch pest data');
  }
  return res.json();
}

export async function apiCalendar(crop: string) {
  const res = await fetch(`${CUD_BASE}/api/calendar?crop=${encodeURIComponent(crop)}`, {
    headers: authHeaders()
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Failed to fetch calendar data');
  }
  return res.json();
}

export async function apiFarmAssistant(question: string) {
  const res = await fetch(`${CUD_BASE}/api/farm-assistant`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ question })
  });
  if (res.status === 401) {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? 'Failed to get AI response');
  }
  return res.json();
}
