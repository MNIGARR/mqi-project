function formatDate(iso) {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString(undefined, { day: '2-digit' }),
    month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    full: d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function EventCard({ event }) {
  const date = formatDate(event.event_date)

  return (
    <article className="card-surface overflow-hidden flex flex-col sm:flex-row">
      <div className="sm:w-56 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-auto overflow-hidden bg-ink/5">
        <img
          src={event.image_url}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 flex flex-1 gap-5">
        <div className="shrink-0 text-center w-14">
          <div className="font-display text-2xl font-bold text-teal-dark leading-none">{date.day}</div>
          <div className="font-mono text-xs tracking-widest text-ink-soft mt-1">{date.month}</div>
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold leading-snug">{event.title}</h3>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">{event.description}</p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-ink-soft">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Time</dt>
              <dd>{date.full}, {date.time}</dd>
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Location</dt>
                <dd>{event.location}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </article>
  )
}
