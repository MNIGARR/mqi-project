<<<<<<< HEAD
// contentService.js
// -----------------------------------------------------------------------------
// Handles the `content` key/value table (about, mission, activities,
// whatsapp, instagram). See categoryService.js for the swap-to-real-API
// pattern this follows.
// -----------------------------------------------------------------------------
import { content } from '../data/mockData'

const SIMULATED_DELAY_MS = 150

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS))
}

// Returns the full content map, e.g. { about, mission, activities, whatsapp, instagram }
export async function getContent() {
  return delay(content)
}

export async function getContentByKey(key) {
  return delay(content[key] ?? '')
=======
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function getContent() {
  const response = await fetch(`${API_BASE_URL}/content`)
  if (!response.ok) {
    throw new Error('Failed to load content')
  }

  const rows = await response.json()
  return rows.reduce((acc, item) => {
    acc[item.key] = item.value
    return acc
  }, {})
}

export async function getContentByKey(key) {
  const response = await fetch(`${API_BASE_URL}/content/${key}`)
  if (!response.ok) {
    return ''
  }
  const data = await response.json()
  return data.value || ''
}

export async function updateContent(key, value) {
  const token = localStorage.getItem('mqi_admin_token')
  const response = await fetch(`${API_BASE_URL}/content/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ value }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update content')
  }

  return data
>>>>>>> d60cabe858e61622caac5ff3a2f1c5b01fd18e67
}
