const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Maps the API's nested camelCase shape back onto the flat snake_case shape
// the existing product components/pages already expect.
function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category_id: row.category ? row.category.id : null,
    image_url: row.imageUrl,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}

function authHeaders() {
  const token = localStorage.getItem('mqi_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getProducts({ categoryId } = {}) {
  const response = await fetch(`${API_BASE_URL}/products`)
  if (!response.ok) {
    throw new Error('Failed to load products')
  }
  const rows = await response.json()
  const mapped = rows.map(mapProduct)
  return categoryId ? mapped.filter((p) => p.category_id === Number(categoryId)) : mapped
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)
  if (!response.ok) {
    return null
  }
  return mapProduct(await response.json())
}

export async function createProduct(payload) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create product')
  }
  return mapProduct(data)
}

export async function updateProduct(id, payload) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update product')
  }
  return mapProduct(data)
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to delete product')
  }
  return true
}
