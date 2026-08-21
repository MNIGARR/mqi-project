import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContent } from '../services/contentService'
import { getCategories } from '../services/categoryService'
import { getEvents } from '../services/eventService'
import EventCard from '../components/events/EventCard'
import SectionHeading from '../components/ui/SectionHeading'

export default function HomePage() {
  const [content, setContent] = useState(null)
  const [categories, setCategories] = useState([])
  const [nextEvent, setNextEvent] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getContent(), getCategories(), getEvents()])
      .then(([contentData, categoryData, eventData]) => {
        if (!active) return
        setContent(contentData)
        setCategories(categoryData)
        setNextEvent(eventData[0] || null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink/10">
        <div className="container-page py-16 sm:py-24 grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
          <div>
            <p className="eyebrow mb-4">A neighborhood collective</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08]">
              Made by hand.
              <br />
              Shared by neighbors.
            </h1>
            <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-lg">
              {content?.about}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary">Browse products</Link>
              <Link to="/events" className="btn-secondary">See upcoming events</Link>
            </div>
          </div>

          <div className="relative">
            <div className="pin-tag card-surface p-6 rotate-1">
              <p className="eyebrow mb-2">Our mission</p>
              <p className="font-display text-xl leading-snug">{content?.mission}</p>
            </div>
            <div className="pin-tag card-surface p-6 -rotate-1 mt-6 ml-8">
              <p className="eyebrow mb-2">What we do</p>
              <p className="text-sm text-ink-soft leading-relaxed">{content?.activities}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Browse by category"
          title="Four ways to take part"
          description="Everything on MQI comes from members of the collective — buy what they make, book their time, or come learn a skill yourself."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/products"
              className="card-surface p-6 hover:border-ink/30 transition-colors"
            >
              <span className="font-display text-lg font-semibold">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Next event teaser */}
      {nextEvent && (
        <section className="container-page pb-20">
          <SectionHeading eyebrow="Don't miss it" title="Coming up next" />
          <EventCard event={nextEvent} />
          <div className="mt-6">
            <Link to="/events" className="text-sm font-medium text-teal-dark hover:underline">
              View all events →
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
