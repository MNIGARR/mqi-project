const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Maps the API's nested camelCase shape back onto the flat snake_case shape
// the existing service components/pages already expect.
function mapService(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category_id: row.category ? row.category.id : null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}

function authHeaders() {
  const token = localStorage.getItem('mqi_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getServices({ categoryId } = {}) {
  const response = await fetch(`${API_BASE_URL}/services`)
  if (!response.ok) {
    throw new Error('Failed to load services')
  }
  const rows = await response.json()
  const mapped = rows.map(mapService)
  return categoryId ? mapped.filter((s) => s.category_id === Number(categoryId)) : mapped
}

export async function getServiceById(id) {
  const response = await fetch(`${API_BASE_URL}/services/${id}`)
  if (!response.ok) {
    return null
  }
  return mapService(await response.json())
}

export async function createService(payload) {
  const response = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create service')
  }
  return mapService(data)
}

export async function updateService(id, payload) {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update service')
  }
  return mapService(data)
}

export async function deleteService(id) {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to delete service')
  }
  return true
}
