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
}
