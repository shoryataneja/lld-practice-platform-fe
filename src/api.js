const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error((body && body.error) || `Request failed (${res.status})`)
  }
  return body
}

export const api = {
  getProblems: () => request('/problems'),
  getProblem: (slug) => request(`/problems/${slug}`),
  createAttempt: (slug) => request(`/problems/${slug}/attempts`, { method: 'POST' }),
  getAttempts: () => request('/attempts'),
  getAttempt: (id) => request(`/attempts/${id}`),
  saveSections: (id, sections) =>
    request(`/attempts/${id}/sections`, { method: 'PUT', body: JSON.stringify({ sections }) }),
  submitAttempt: (id) => request(`/attempts/${id}/submit`, { method: 'POST' }),

  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
}