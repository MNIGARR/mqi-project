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
}
