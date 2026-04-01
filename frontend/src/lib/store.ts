export interface ScanEntry {
  date: string;
  crop: string;
  confidence: number;
  N: number;
  P: number;
  K: number;
  ph?: number;
}

export interface User {
  name: string;
  email: string;
  state?: string;
  acres?: number;
}

export const getToken = () => localStorage.getItem('vb_token');
export const setToken = (t: string) => localStorage.setItem('vb_token', t);

export const getUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem('vb_user') ?? 'null');
  } catch {
    return null;
  }
};

export const setUser = (u: User) => localStorage.setItem('vb_user', JSON.stringify(u));

export const getLang = () => localStorage.getItem('vb_lang') ?? 'en';
export const setLang = (l: string) => localStorage.setItem('vb_lang', l);

export function getHistory(): ScanEntry[] {
  try {
    return JSON.parse(localStorage.getItem('vb_history') || '[]');
  } catch {
    return [];
  }
}

export function addHistory(entry: ScanEntry) {
  const h = getHistory();
  h.unshift(entry);
  localStorage.setItem('vb_history', JSON.stringify(h.slice(0, 20)));
}

export const addToHistory = addHistory;

export function logout() {
  ['vb_token', 'vb_user', 'vb_history', 'vb_lang', 'vb_last_crop'].forEach(k => localStorage.removeItem(k));
}
