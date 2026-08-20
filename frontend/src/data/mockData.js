// mockData.js
// -----------------------------------------------------------------------------
// Client-side mock data modeled directly on schema.sql / seed.sql.
// Every shape here mirrors the eventual Postgres rows (same field names,
// same types-as-JS-equivalents) so that swapping these arrays for real API
// responses later requires no changes to components — only to the service
// layer in /src/services.
// -----------------------------------------------------------------------------

export const categories = [
  { id: 1, name: 'Handmade', created_at: '2025-01-10T09:00:00Z' },
  { id: 2, name: 'Food', created_at: '2025-01-10T09:00:00Z' },
  { id: 3, name: 'Clothing', created_at: '2025-01-10T09:00:00Z' },
  { id: 4, name: 'Workshops', created_at: '2025-01-10T09:00:00Z' },
]

export const products = [
  {
    id: 1,
    name: 'Hand-thrown Stoneware Mug',
    description: 'A matte-glazed mug thrown on the wheel in small batches. Holds 12oz, dishwasher safe.',
    price: 28.0,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1506372023823-741c83b836fe?w=800&q=80',
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Woven Market Basket',
    description: 'Palm-leaf basket woven by our textile circle. Sturdy handles, roomy enough for a farmers market run.',
    price: 42.5,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1622560481156-01415bb5a7bc?w=800&q=80',
    created_at: '2025-02-02T10:00:00Z',
    updated_at: '2025-02-02T10:00:00Z',
  },
  {
    id: 3,
    name: 'Small-batch Sourdough Loaf',
    description: 'Naturally leavened, 48-hour cold ferment. Baked every Friday by our kitchen collective.',
    price: 9.0,
    category_id: 2,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    created_at: '2025-02-03T10:00:00Z',
    updated_at: '2025-02-03T10:00:00Z',
  },
  {
    id: 4,
    name: 'Chili-Lime Preserve Jar',
    description: 'Sweet-hot preserve made from surplus produce donated by neighborhood gardens.',
    price: 12.0,
    category_id: 2,
    image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
    created_at: '2025-02-04T10:00:00Z',
    updated_at: '2025-02-04T10:00:00Z',
  },
  {
    id: 5,
    name: 'Block-printed Cotton Scarf',
    description: 'Hand block-printed with natural indigo dye. One-of-a-kind pattern on every piece.',
    price: 34.0,
    category_id: 3,
    image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
    created_at: '2025-02-05T10:00:00Z',
    updated_at: '2025-02-05T10:00:00Z',
  },
  {
    id: 6,
    name: 'Upcycled Denim Tote',
    description: 'Stitched from reclaimed denim by our repair-and-reuse workshop graduates.',
    price: 22.0,
    category_id: 3,
    image_url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
    created_at: '2025-02-06T10:00:00Z',
    updated_at: '2025-02-06T10:00:00Z',
  },
  {
    id: 7,
    name: 'Beeswax Candle Set',
    description: 'Three hand-poured beeswax pillars, unscented, wax sourced from a local apiary.',
    price: 18.0,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1608181831718-c9ffd8630532?w=800&q=80',
    created_at: '2025-02-07T10:00:00Z',
    updated_at: '2025-02-07T10:00:00Z',
  },
  {
    id: 8,
    name: 'Herb & Spice Blend Trio',
    description: 'Three house blends — smoky, citrus, and herb-garden — grown and dried on the community plot.',
    price: 15.0,
    category_id: 2,
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    created_at: '2025-02-08T10:00:00Z',
    updated_at: '2025-02-08T10:00:00Z',
  },
]

export const services = [
  {
    id: 1,
    name: 'Sewing Machine Repair',
    description: 'Drop-in tune-ups and repairs for home sewing machines, done by our textile volunteers.',
    price: 15.0,
    category_id: 3,
    created_at: '2025-02-01T10:00:00Z',
    updated_at: '2025-02-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Community Meal Catering',
    description: 'Book our kitchen collective for small gatherings — plant-forward menus, 10 to 60 guests.',
    price: 12.0,
    category_id: 2,
    created_at: '2025-02-02T10:00:00Z',
    updated_at: '2025-02-02T10:00:00Z',
  },
  {
    id: 3,
    name: 'Pottery Wheel Rental (per hour)',
    description: 'Studio access with a wheel, tools, and a starter bag of clay. Glazing and firing billed separately.',
    price: 20.0,
    category_id: 1,
    created_at: '2025-02-03T10:00:00Z',
    updated_at: '2025-02-03T10:00:00Z',
  },
  {
    id: 4,
    name: 'Clothing Alterations',
    description: 'Hems, resizing, and patch repairs, turned around within a week by our tailoring circle.',
    price: 10.0,
    category_id: 3,
    created_at: '2025-02-04T10:00:00Z',
    updated_at: '2025-02-04T10:00:00Z',
  },
]

export const events = [
  {
    id: 1,
    title: 'Beginner Wheel-Throwing Workshop',
    description: 'A hands-on introduction to the pottery wheel. All materials included, no experience needed.',
    event_date: '2026-09-06T16:00:00Z',
    location: 'MQI Studio, Room 2',
    image_url: 'https://images.unsplash.com/photo-1565193298357-c5b46e7e2ce4?w=800&q=80',
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Saturday Community Market',
    description: 'Members sell handmade goods, food, and clothing. Open to the public, family friendly.',
    event_date: '2026-09-12T14:00:00Z',
    location: 'MQI Courtyard',
    image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80',
    created_at: '2025-06-02T10:00:00Z',
    updated_at: '2025-06-02T10:00:00Z',
  },
  {
    id: 3,
    title: 'Natural Dye & Block Print Circle',
    description: 'Learn indigo vat dyeing and hand block-printing on cotton. Bring a plain shirt or tote to print.',
    event_date: '2026-09-20T15:30:00Z',
    location: 'MQI Textile Room',
    image_url: 'https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=800&q=80',
    created_at: '2025-06-03T10:00:00Z',
    updated_at: '2025-06-03T10:00:00Z',
  },
  {
    id: 4,
    title: 'Fermentation Basics: Bread & Preserves',
    description: 'A kitchen collective session on sourdough starters and small-batch preserving.',
    event_date: '2026-10-03T17:00:00Z',
    location: 'MQI Community Kitchen',
    image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    created_at: '2025-06-04T10:00:00Z',
    updated_at: '2025-06-04T10:00:00Z',
  },
]

// Editable text blocks, keyed exactly like the `content` table.
export const content = {
  about: 'MQI Community is a neighborhood collective of makers, cooks, and teachers who share tools, skills, and a workshop space. We started as a handful of neighbors trading skills over a kitchen table, and have grown into a small marketplace and studio open to anyone who wants to make something with their hands.',
  mission: 'To keep practical skills — sewing, cooking, ceramics, repair — alive and accessible in our neighborhood, and to give makers a low-cost way to sell what they create.',
  activities: 'We run a weekly studio open house, a Saturday community market, and rotating workshops in pottery, textiles, and food preservation. Members can also book shared equipment like the pottery wheels and sewing machines by the hour.',
  whatsapp: 'https://wa.me/000000000',
  instagram: 'https://instagram.com/',
}

// Admin record shape (UI-only reference — never expose password_hash in a
// real client). Included so the login page's mental model matches the schema.
export const admin = {
  id: 1,
  email: 'admin@mqi-project.local',
  name: 'Admin',
}
