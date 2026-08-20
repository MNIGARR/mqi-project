<<<<<<< HEAD
// authService.js
// -----------------------------------------------------------------------------
// UI-only stub. The Admin Login page calls this so the form is fully wired,
// but there is no real authentication yet — swap the body for a real
// POST /admin/login call (and store the returned token/session) once the
// backend exists.
// -----------------------------------------------------------------------------

const SIMULATED_DELAY_MS = 400

export async function loginAdmin({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        reject(new Error('Email and password are required.'))
        return
      }
      // Placeholder only — real credential checking happens server-side later.
      reject(new Error('The backend is not connected yet. This form is UI only.'))
    }, SIMULATED_DELAY_MS)
  })
=======
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
>>>>>>> d60cabe858e61622caac5ff3a2f1c5b01fd18e67
}
