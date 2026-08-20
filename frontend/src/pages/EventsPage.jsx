import { useEffect, useState } from 'react'
import { getEvents } from '../services/eventService'
import EventCard from '../components/events/EventCard'
import SectionHeading from '../components/ui/SectionHeading'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getEvents().then((data) => {
      if (!active) return
      setEvents(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="Mark your calendar"
        title="Upcoming events"
        description="Workshops, markets, and gatherings run by the collective. Open to members and neighbors alike."
      />

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface h-40 animate-pulse bg-ink/5" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card-surface p-10 text-center text-ink-soft">
          No events on the calendar right now — check back soon.
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
