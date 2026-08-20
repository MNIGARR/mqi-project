import { useState } from 'react'
<<<<<<< HEAD
import { loginAdmin } from '../services/authService'
=======
import { loginAdmin, getCurrentAdmin } from '../services/authService'
>>>>>>> d60cabe858e61622caac5ff3a2f1c5b01fd18e67

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
<<<<<<< HEAD
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [error, setError] = useState('')
=======
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [admin, setAdmin] = useState(null)
>>>>>>> d60cabe858e61622caac5ff3a2f1c5b01fd18e67

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
<<<<<<< HEAD
      await loginAdmin({ email, password })
      setStatus('idle')
=======
      const result = await loginAdmin({ email, password })
      const currentAdmin = await getCurrentAdmin()
      setAdmin(currentAdmin)
      setStatus('idle')
      console.log('Logged in admin:', result.admin)
>>>>>>> d60cabe858e61622caac5ff3a2f1c5b01fd18e67
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-block w-3 h-3 rounded-full bg-marigold mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">Admin sign in</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Manage products, services, and events for MQI Community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mqi-project.local"
              className="w-full rounded-sm border border-ink/20 bg-paper px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:border-teal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-sm border border-ink/20 bg-paper px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:border-teal focus:outline-none"
            />
          </div>

          {status === 'error' && (
            <p role="alert" className="text-sm text-plum-dark bg-plum/10 border border-plum/20 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

<<<<<<< HEAD
        <p className="mt-6 text-center text-xs text-ink-soft">
          This form is not yet connected to the backend.
        </p>
=======
        {admin && (
          <div className="mt-6 rounded-sm border border-teal/30 bg-teal/5 p-3 text-sm text-teal-dark">
            Signed in as {admin.name || admin.email}
          </div>
        )}
>>>>>>> d60cabe858e61622caac5ff3a2f1c5b01fd18e67
      </div>
    </div>
  )
}
