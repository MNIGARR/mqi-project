<<<<<<< HEAD
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
=======
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function getEvents() {
  const response = await fetch(`${API_BASE_URL}/events`)
  if (!response.ok) {
    throw new Error('Failed to load events')
  }
  return response.json()
}

export async function getEventById(id) {
  const response = await fetch(`${API_BASE_URL}/events/${id}`)
  if (!response.ok) {
    return null
  }
  return response.json()
}

export async function createEvent(payload) {
  const token = localStorage.getItem('mqi_admin_token')
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create event')
  }
  return data
}

export async function updateEvent(id, payload) {
  const token = localStorage.getItem('mqi_admin_token')
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update event')
  }
  return data
}

export async function deleteEvent(id) {
  const token = localStorage.getItem('mqi_admin_token')
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to delete event')
  }

  return true
>>>>>>> d60cabe858e61622caac5ff3a2f1c5b01fd18e67
}
