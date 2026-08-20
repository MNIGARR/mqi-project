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
}
