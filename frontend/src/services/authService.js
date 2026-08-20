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
}
