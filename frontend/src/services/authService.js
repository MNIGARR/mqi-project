const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function loginAdmin({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required.')
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Login failed.')
  }

  if (payload.token) {
    localStorage.setItem('mqi_admin_token', payload.token)
  }

  return payload
}

export function getStoredAdminToken() {
  return localStorage.getItem('mqi_admin_token') || ''
}

export function logoutAdmin() {
  localStorage.removeItem('mqi_admin_token')
}

export async function getCurrentAdmin() {
  const token = getStoredAdminToken()
  if (!token) {
    return null
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    localStorage.removeItem('mqi_admin_token')
    return null
  }

  return response.json()
}