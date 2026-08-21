const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`)
  if (!response.ok) {
    throw new Error('Failed to load categories')
  }
  return response.json()
}

export async function getCategoryById(id) {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`)
  if (!response.ok) {
    return null
  }
  return response.json()
}
