// serviceService.js
// -----------------------------------------------------------------------------
// Handles the `services` table (community services offered), not to be
// confused with this /src/services folder name. See categoryService.js for
// the swap-to-real-API pattern.
// -----------------------------------------------------------------------------
import { services } from '../data/mockData'

const SIMULATED_DELAY_MS = 150

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS))
}

export async function getServices({ categoryId } = {}) {
  const list = categoryId
    ? services.filter((s) => s.category_id === Number(categoryId))
    : services
  return delay(list)
}

export async function getServiceById(id) {
  return delay(services.find((s) => s.id === Number(id)) || null)
}
