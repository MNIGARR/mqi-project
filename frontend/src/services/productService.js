// productService.js
// -----------------------------------------------------------------------------
// See categoryService.js for the swap-to-real-API pattern this follows.
// -----------------------------------------------------------------------------
import { products } from '../data/mockData'

const SIMULATED_DELAY_MS = 150

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS))
}

export async function getProducts({ categoryId } = {}) {
  const list = categoryId
    ? products.filter((p) => p.category_id === Number(categoryId))
    : products
  return delay(list)
}

export async function getProductById(id) {
  return delay(products.find((p) => p.id === Number(id)) || null)
}
