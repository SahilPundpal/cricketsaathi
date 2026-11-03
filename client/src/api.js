// Each browser tab gets its own random id so visitors never share a demo match.
function sessionId() {
  try {
    let id = sessionStorage.getItem('cricketsaathi-session');
    if (!id) {
      id = (window.crypto?.randomUUID?.() || `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`).replace(/[^A-Za-z0-9_-]/g, '');
      sessionStorage.setItem('cricketsaathi-session', id);
    }
    return id;
  } catch {
    return 'default';
  }
}

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', 'X-Session-Id': sessionId(), ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

export const api = {
  health: () => request('/health'),
  getMatch: () => request('/match/current'),
  advanceBall: (balls = 1) => request('/match/advance', { method: 'POST', body: JSON.stringify({ balls }) }),
  resetMatch: () => request('/match/reset', { method: 'POST', body: '{}' }),
  aiStatus: () => request('/ai/status'),
  // window: { sinceBalls } to cover everything since the fan last looked, or { lastOvers } for a fixed window
  recap: (language, window = {}) => request('/ai/recap', { method: 'POST', body: JSON.stringify({ language, ...window }) }),
  chat: (question, language, history) => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ question, language, history }),
  }),
};
