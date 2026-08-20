// eventService.js
// -----------------------------------------------------------------------------
// See categoryService.js for the swap-to-real-API pattern.
// -----------------------------------------------------------------------------
import { events } from '../data/mockData'

const SIMULATED_DELAY_MS = 150

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS))
}

export async function getEvents() {
  // Sorted soonest-first, mirroring an `ORDER BY event_date ASC` query.
  const sorted = [...events].sort(
    (a, b) => new Date(a.event_date) - new Date(b.event_date)
  )
  return delay(sorted)
}

export async function getEventById(id) {
  return delay(events.find((e) => e.id === Number(id)) || null)
}
