const API_BASE = 'https://bst-backend.onrender.com/api';

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}
export function setTokens({ accessToken, refreshToken }) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}
export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}
export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}
export function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Token süresi dolmuşsa refresh dene
  if (res.status === 401 && getRefreshToken()) {
    const r = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
    if (r.ok) {
      const data = await r.json();
      setTokens(data);
      setUser(data.user);
      headers.Authorization = `Bearer ${data.accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = 'login.html';
      return;
    }
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || 'İstek başarısız.');
  return data;
}