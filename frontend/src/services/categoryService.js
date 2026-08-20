// categoryService.js
// -----------------------------------------------------------------------------
// Service layer: today this reads from mock data, later it will call the
// real API. Every function returns a Promise so calling components never
// need to change when the implementation swaps.
//
// To connect the real backend:
//   1. Replace the body of each function with a fetch()/axios call, e.g.
//        export async function getCategories() {
//          const res = await fetch(`${API_BASE_URL}/categories`)
//          if (!res.ok) throw new Error('Failed to load categories')
//          return res.json()
//        }
//   2. Keep the function names and return shapes identical so components,
//      pages, and hooks require zero changes.
// -----------------------------------------------------------------------------
import { categories } from '../data/mockData'

const SIMULATED_DELAY_MS = 150

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS))
}

export async function getCategories() {
  return delay(categories)
}

export async function getCategoryById(id) {
  return delay(categories.find((c) => c.id === Number(id)) || null)
}
