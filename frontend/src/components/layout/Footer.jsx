import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContent } from '../../services/contentService'

export default function Footer() {
  const [links, setLinks] = useState({ whatsapp: '', instagram: '' })

  useEffect(() => {
    let active = true
    getContent().then((data) => {
      if (active) setLinks({ whatsapp: data.whatsapp, instagram: data.instagram })
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <footer className="mt-24 border-t border-ink/10">
      <div className="container-page py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="MQI" className="h-9 w-9 rounded-md object-cover" />
            <div className="leading-tight">
              <p className="font-display text-base font-semibold">MQI</p>
              <p className="text-[11px] text-ink-soft">Mingəçevir Qadın İcması</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-soft leading-relaxed max-w-xs">
            A neighborhood collective of makers, cooks, and teachers.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-3">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="text-ink-soft hover:text-ink">Products</Link></li>
            <li><Link to="/services" className="text-ink-soft hover:text-ink">Services</Link></li>
            <li><Link to="/events" className="text-ink-soft hover:text-ink">Events</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">Say hello</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a 
                href={links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-soft hover:text-ink"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a 
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-soft hover:text-ink"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="container-page py-5 text-xs text-ink-soft font-mono">
          © {new Date().getFullYear()} MQI Community. Made by neighbors, for neighbors.
        </div>
      </div>
    </footer>
  )
}