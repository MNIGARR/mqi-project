import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/services', label: 'Services' },
  { to: '/events', label: 'Events' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="container-page flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-marigold" aria-hidden="true" />
          MQI Community
        </NavLink>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${
                  isActive ? 'text-teal-dark' : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <NavLink to="/admin/login" className="btn-secondary text-sm px-4 py-2">
            Admin login
          </NavLink>
        </div>

        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-ink"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-ink/10 bg-paper" aria-label="Mobile">
          <div className="container-page py-4 flex flex-col gap-4">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-base font-medium ${isActive ? 'text-teal-dark' : 'text-ink-soft'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="btn-secondary text-sm px-4 py-2 w-fit"
            >
              Admin login
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  )
}
