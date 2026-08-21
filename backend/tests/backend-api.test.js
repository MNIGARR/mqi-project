process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-automated-tests';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createApp = require('../src/app');

function extractSetColumns(sql) {
  const setMatch = sql.match(/set\s+(.+?)\s+where/i);
  if (!setMatch) return [];
  return setMatch[1].split(',').map((part) => part.trim().split('=')[0].trim());
}

function createFakeDb() {
  const adminHash = bcrypt.hashSync('ChangeMe123!', 10);
  const state = {
    admins: [{ id: 1, email: 'admin@mqi-project.local', password_hash: adminHash, name: 'Admin' }],
    events: [
      { id: 1, title: 'Community Meetup', description: 'Welcome', event_date: '2026-09-15T14:00:00.000Z', location: 'Baku', image_url: 'https://example.com/1.jpg', created_at: '2026-09-01T00:00:00.000Z', updated_at: '2026-09-01T00:00:00.000Z' }
    ],
    content: [
      { key: 'about', value: 'About the community.', updated_at: '2026-09-01T00:00:00.000Z' },
      { key: 'mission', value: 'Our mission.', updated_at: '2026-09-01T00:00:00.000Z' }
    ],
    categories: [
      { id: 1, name: 'Handmade', created_at: '2026-09-01T00:00:00.000Z' },
      { id: 2, name: 'Food', created_at: '2026-09-01T00:00:00.000Z' }
    ],
    products: [
      { id: 1, name: 'Handmade Bag', description: 'A nice bag', price: '35.00', category_id: 1, image_url: 'https://example.com/bag.jpg', created_at: '2026-09-01T00:00:00.000Z', updated_at: '2026-09-01T00:00:00.000Z' }
    ],
    services: [
      { id: 1, name: 'Sewing Service', description: 'Custom sewing', price: '20.00', category_id: 1, created_at: '2026-09-01T00:00:00.000Z', updated_at: '2026-09-01T00:00:00.000Z' }
    ]
  };

  let nextCategoryId = 3;
  let nextProductId = 2;
  let nextServiceId = 2;

  function joinCategory(row) {
    if (!row) return row;
    const category = state.categories.find((c) => c.id === row.category_id);
    return {
      ...row,
      category_id: category ? category.id : null,
      category_name: category ? category.name : null,
    };
  }

  const db = {
    query: async (sql, params = []) => {
      const text = sql.toLowerCase();

      if (text.includes('from admins') && text.includes('where email')) {
        const email = params[0];
        const admin = state.admins.find((item) => item.email === email);
        return { rows: admin ? [admin] : [] };
      }

      if (text.includes('from admins') && text.includes('where id')) {
        const id = Number(params[0]);
        const admin = state.admins.find((item) => item.id === id);
        return { rows: admin ? [admin] : [] };
      }

      if (text.includes('delete from events')) {
        const id = Number(params[0]);
        const index = state.events.findIndex((item) => item.id === id);
        if (index === -1) return { rowCount: 0 };
        state.events.splice(index, 1);
        return { rowCount: 1 };
      }

      if (text.includes('select') && text.includes('count') && (text.includes('from events') || text.includes('from products') || text.includes('from services') || text.includes('from categories'))) {
        return {
          rows: [{ events: state.events.length, products: 20, services: 8, categories: 4 }]
        };
      }

      if (text.includes('from events')) {
        if (text.includes('where id')) {
          const id = Number(params[0]);
          const event = state.events.find((item) => item.id === id);
          return { rows: event ? [event] : [] };
        }

        return { rows: [...state.events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)) };
      }

      if (text.includes('insert into events')) {
        const inserted = {
          id: state.events.length ? Math.max(...state.events.map((e) => e.id)) + 1 : 1,
          title: params[0],
          description: params[1],
          event_date: params[2],
          location: params[3],
          image_url: params[4],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        state.events.push(inserted);
        return { rows: [inserted], rowCount: 1 };
      }

      if (text.includes('update events')) {
        const id = Number(params[params.length - 1]);
        const event = state.events.find((item) => item.id === id);
        if (!event) return { rows: [] };
        const updates = {
          title: params[0],
          description: params[1],
          event_date: params[2],
          location: params[3],
          image_url: params[4],
          updated_at: new Date().toISOString()
        };
        Object.assign(event, updates);
        return { rows: [event] };
      }

      if (text.includes('from content')) {
        if (text.includes('where key')) {
          const key = params[0];
          const item = state.content.find((entry) => entry.key === key);
          return { rows: item ? [item] : [] };
        }
        return { rows: [...state.content] };
      }

      if (text.includes('update content')) {
        const key = params[params.length - 1];
        const value = params[0];
        const existing = state.content.find((entry) => entry.key === key);
        if (existing) {
          existing.value = value;
          existing.updated_at = new Date().toISOString();
          return { rows: [existing] };
        }
        const item = { key, value, updated_at: new Date().toISOString() };
        state.content.push(item);
        return { rows: [item] };
      }

      if (text.includes('delete from categories')) {
        const id = Number(params[0]);
        const index = state.categories.findIndex((item) => item.id === id);
        if (index === -1) return { rowCount: 0 };
        state.categories.splice(index, 1);
        return { rowCount: 1 };
      }

      if (text.includes('insert into categories')) {
        const name = params[0];
        if (state.categories.some((item) => item.name === name)) {
          const error = new Error('duplicate key value violates unique constraint');
          error.code = '23505';
          throw error;
        }
        const inserted = { id: nextCategoryId++, name, created_at: new Date().toISOString() };
        state.categories.push(inserted);
        return { rows: [inserted], rowCount: 1 };
      }

      if (text.includes('update categories')) {
        const id = Number(params[params.length - 1]);
        const name = params[0];
        const category = state.categories.find((item) => item.id === id);
        if (!category) return { rows: [] };
        if (state.categories.some((item) => item.name === name && item.id !== id)) {
          const error = new Error('duplicate key value violates unique constraint');
          error.code = '23505';
          throw error;
        }
        category.name = name;
        return { rows: [category] };
      }

      if (text.includes('from categories')) {
        if (text.includes('where id')) {
          const id = Number(params[0]);
          const category = state.categories.find((item) => item.id === id);
          return { rows: category ? [category] : [] };
        }
        return { rows: [...state.categories].sort((a, b) => a.name.localeCompare(b.name)) };
      }

      if (text.includes('delete from products')) {
        const id = Number(params[0]);
        const index = state.products.findIndex((item) => item.id === id);
        if (index === -1) return { rowCount: 0 };
        state.products.splice(index, 1);
        return { rowCount: 1 };
      }

      if (text.includes('insert into products')) {
        const inserted = {
          id: nextProductId++,
          name: params[0],
          description: params[1],
          price: params[2],
          category_id: params[3],
          image_url: params[4],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        state.products.push(inserted);
        return { rows: [{ id: inserted.id }], rowCount: 1 };
      }

      if (text.includes('update products')) {
        const id = Number(params[params.length - 1]);
        const product = state.products.find((item) => item.id === id);
        if (!product) return { rowCount: 0 };
        const columns = extractSetColumns(sql);
        columns.forEach((column, index) => {
          product[column] = params[index];
        });
        product.updated_at = new Date().toISOString();
        return { rowCount: 1 };
      }

      if (text.includes('from products') && text.includes('join')) {
        if (text.includes('where p.id')) {
          const id = Number(params[0]);
          const product = state.products.find((item) => item.id === id);
          return { rows: product ? [joinCategory(product)] : [] };
        }
        return {
          rows: [...state.products]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id)
            .map(joinCategory),
        };
      }

      if (text.includes('from products')) {
        const id = Number(params[0]);
        const product = state.products.find((item) => item.id === id);
        return { rows: product ? [{ id: product.id }] : [] };
      }

      if (text.includes('delete from services')) {
        const id = Number(params[0]);
        const index = state.services.findIndex((item) => item.id === id);
        if (index === -1) return { rowCount: 0 };
        state.services.splice(index, 1);
        return { rowCount: 1 };
      }

      if (text.includes('insert into services')) {
        const inserted = {
          id: nextServiceId++,
          name: params[0],
          description: params[1],
          price: params[2],
          category_id: params[3],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        state.services.push(inserted);
        return { rows: [{ id: inserted.id }], rowCount: 1 };
      }

      if (text.includes('update services')) {
        const id = Number(params[params.length - 1]);
        const service = state.services.find((item) => item.id === id);
        if (!service) return { rowCount: 0 };
        const columns = extractSetColumns(sql);
        columns.forEach((column, index) => {
          service[column] = params[index];
        });
        service.updated_at = new Date().toISOString();
        return { rowCount: 1 };
      }

      if (text.includes('from services') && text.includes('join')) {
        if (text.includes('where s.id')) {
          const id = Number(params[0]);
          const service = state.services.find((item) => item.id === id);
          return { rows: service ? [joinCategory(service)] : [] };
        }
        return {
          rows: [...state.services]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id)
            .map(joinCategory),
        };
      }

      if (text.includes('from services')) {
        const id = Number(params[0]);
        const service = state.services.find((item) => item.id === id);
        return { rows: service ? [{ id: service.id }] : [] };
      }

      return { rows: [] };
    }
  };

  return db;
}

function createTestApp() {
  return createApp({ db: createFakeDb() });
}

const validJwt = jwt.sign({ sub: 1, email: 'admin@mqi-project.local' }, process.env.JWT_SECRET, { expiresIn: '1d' });

test('POST /api/auth/login succeeds with correct credentials', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@mqi-project.local', password: 'ChangeMe123!' });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  assert.equal(response.body.admin.email, 'admin@mqi-project.local');
  assert.equal(response.body.admin.password_hash, undefined);
});

test('POST /api/auth/login rejects wrong password', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@mqi-project.local', password: 'WrongPassword' });

  assert.equal(response.status, 401);
});

test('POST /api/auth/login rejects nonexistent user', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'nobody@mqi-project.local', password: 'ChangeMe123!' });

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Invalid credentials');
});

test('POST /api/auth/login rejects malformed request', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@mqi-project.local' });

  assert.equal(response.status, 400);
});

test('GET /api/auth/me without token is rejected', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/auth/me');
  assert.equal(response.status, 401);
});

test('GET /api/auth/me with invalid token is rejected', async () => {
  const app = createTestApp();
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer invalid-token');

  assert.equal(response.status, 401);
});

test('GET /api/auth/me with expired token is rejected', async () => {
  const app = createTestApp();
  const expiredJwt = jwt.sign({ sub: 1, email: 'admin@mqi-project.local' }, process.env.JWT_SECRET, {
    expiresIn: -10,
  });
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${expiredJwt}`);

  assert.equal(response.status, 401);
});

test('GET /api/auth/me with valid token succeeds', async () => {
  const app = createTestApp();
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${validJwt}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.email, 'admin@mqi-project.local');
});

test('GET /api/events returns events', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/events');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('GET /api/events/:id returns an event', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/events/1');
  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
});

test('GET /api/events/:id 404 for missing event', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/events/999');
  assert.equal(response.status, 404);
});

test('POST /api/events requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/events')
    .send({ title: 'Workshop', event_date: '2026-10-01T10:00:00.000Z' });

  assert.equal(response.status, 401);
});

test('POST /api/events with authentication creates an event', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ title: 'Workshop', description: 'Hands-on session', event_date: '2026-10-01T10:00:00.000Z', location: 'Baku', image_url: 'https://example.com/workshop.jpg' });

  assert.equal(response.status, 201);
  assert.equal(response.body.title, 'Workshop');
});

test('POST /api/events with invalid data is rejected', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ description: 'Missing title and event_date' });

  assert.equal(response.status, 400);
});

test('PUT /api/events/:id updates an existing event', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/events/1')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ title: 'Updated Meetup', location: 'Ganja' });

  assert.equal(response.status, 200);
  assert.equal(response.body.title, 'Updated Meetup');
});

test('PUT /api/events/:id 404 for nonexistent event', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/events/999')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ title: 'Does not exist' });

  assert.equal(response.status, 404);
});

test('DELETE /api/events/:id removes an existing event', async () => {
  const app = createTestApp();
  const response = await request(app)
    .delete('/api/events/1')
    .set('Authorization', `Bearer ${validJwt}`);

  assert.equal(response.status, 204);
});

test('DELETE /api/events/:id 404 for nonexistent event', async () => {
  const app = createTestApp();
  const response = await request(app)
    .delete('/api/events/999')
    .set('Authorization', `Bearer ${validJwt}`);

  assert.equal(response.status, 404);
});

test('GET /api/content returns content list', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/content');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('GET /api/content/:key returns content item', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/content/about');
  assert.equal(response.status, 200);
  assert.equal(response.body.key, 'about');
});

test('GET /api/content/:key 404 for nonexistent key', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/content/does-not-exist');
  assert.equal(response.status, 404);
});

test('PUT /api/content/:key without authentication is rejected', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/content/about')
    .send({ value: 'Updated community description' });

  assert.equal(response.status, 401);
});

test('PUT /api/content/:key updates with authentication', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/content/about')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ value: 'Updated community description' });

  assert.equal(response.status, 200);
  assert.equal(response.body.value, 'Updated community description');
});

test('PUT /api/content/:key rejects invalid data', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/content/about')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ value: '' });

  assert.equal(response.status, 400);
});

test('GET /api/admin/stats requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/admin/stats');
  assert.equal(response.status, 401);
});

test('GET /api/admin/stats returns count data with a valid token', async () => {
  const app = createTestApp();
  const response = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${validJwt}`);

  assert.equal(response.status, 200);
  assert.ok(response.body.events >= 0);
  assert.ok(response.body.products >= 0);
  assert.ok(response.body.services >= 0);
  assert.ok(response.body.categories >= 0);
});

test('GET /api/categories returns categories', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/categories');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length >= 1);
});

test('GET /api/categories/:id returns a category', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/categories/1');
  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
});

test('GET /api/categories/:id returns 404 for nonexistent category', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/categories/999');
  assert.equal(response.status, 404);
});

test('GET /api/categories/:id rejects invalid ID', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/categories/not-a-number');
  assert.equal(response.status, 400);
});

test('POST /api/categories requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).post('/api/categories').send({ name: 'Clothing' });
  assert.equal(response.status, 401);
});

test('POST /api/categories creates category with valid token', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Clothing' });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Clothing');
});

test('POST /api/categories rejects missing name', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({});

  assert.equal(response.status, 400);
});

test('POST /api/categories rejects duplicate name', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Handmade' });

  assert.equal(response.status, 409);
});

test('PUT /api/categories/:id requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).put('/api/categories/1').send({ name: 'Renamed' });
  assert.equal(response.status, 401);
});

test('PUT /api/categories/:id updates category', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/categories/1')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Renamed' });

  assert.equal(response.status, 200);
  assert.equal(response.body.name, 'Renamed');
});

test('PUT /api/categories/:id returns 404 for nonexistent category', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/categories/999')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Renamed' });

  assert.equal(response.status, 404);
});

test('DELETE /api/categories/:id requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).delete('/api/categories/1');
  assert.equal(response.status, 401);
});

test('DELETE /api/categories/:id deletes category', async () => {
  const app = createTestApp();
  const response = await request(app)
    .delete('/api/categories/1')
    .set('Authorization', `Bearer ${validJwt}`);

  assert.equal(response.status, 204);
});

test('GET /api/products returns products', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/products');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length >= 1);
  assert.ok(response.body[0].category === null || typeof response.body[0].category === 'object');
});

test('GET /api/products/:id returns a product with category info', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/products/1');
  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
  assert.equal(response.body.category.name, 'Handmade');
});

test('GET /api/products/:id returns 404 for nonexistent product', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/products/999');
  assert.equal(response.status, 404);
});

test('GET /api/products/:id rejects invalid ID', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/products/not-a-number');
  assert.equal(response.status, 400);
});

test('POST /api/products requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).post('/api/products').send({ name: 'Bracelet' });
  assert.equal(response.status, 401);
});

test('POST /api/products creates a product', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Bracelet', price: 12.5, categoryId: 1, imageUrl: 'https://example.com/bracelet.jpg' });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Bracelet');
  assert.equal(response.body.category.id, 1);
});

test('POST /api/products rejects invalid price', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Bracelet', price: -5 });

  assert.equal(response.status, 400);
});

test('POST /api/products rejects invalid category', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Bracelet', categoryId: 999 });

  assert.equal(response.status, 404);
});

test('PUT /api/products/:id updates a product', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/products/1')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ price: 40 });

  assert.equal(response.status, 200);
  assert.equal(Number(response.body.price), 40);
});

test('PUT /api/products/:id returns 404 for nonexistent product', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/products/999')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ price: 40 });

  assert.equal(response.status, 404);
});

test('DELETE /api/products/:id requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).delete('/api/products/1');
  assert.equal(response.status, 401);
});

test('DELETE /api/products/:id deletes a product', async () => {
  const app = createTestApp();
  const response = await request(app)
    .delete('/api/products/1')
    .set('Authorization', `Bearer ${validJwt}`);

  assert.equal(response.status, 204);
});

test('GET /api/services returns services', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/services');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length >= 1);
});

test('GET /api/services/:id returns a service with category info', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/services/1');
  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
  assert.equal(response.body.category.name, 'Handmade');
});

test('GET /api/services/:id returns 404 for nonexistent service', async () => {
  const app = createTestApp();
  const response = await request(app).get('/api/services/999');
  assert.equal(response.status, 404);
});

test('POST /api/services requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).post('/api/services').send({ name: 'Tailoring' });
  assert.equal(response.status, 401);
});

test('POST /api/services creates a service', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Tailoring', price: 15, categoryId: 1 });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Tailoring');
  assert.equal(response.body.category.id, 1);
});

test('POST /api/services rejects invalid price', async () => {
  const app = createTestApp();
  const response = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ name: 'Tailoring', price: -5 });

  assert.equal(response.status, 400);
});

test('PUT /api/services/:id updates a service', async () => {
  const app = createTestApp();
  const response = await request(app)
    .put('/api/services/1')
    .set('Authorization', `Bearer ${validJwt}`)
    .send({ price: 25 });

  assert.equal(response.status, 200);
  assert.equal(Number(response.body.price), 25);
});

test('DELETE /api/services/:id requires authentication', async () => {
  const app = createTestApp();
  const response = await request(app).delete('/api/services/1');
  assert.equal(response.status, 401);
});

test('DELETE /api/services/:id deletes a service', async () => {
  const app = createTestApp();
  const response = await request(app)
    .delete('/api/services/1')
    .set('Authorization', `Bearer ${validJwt}`);

  assert.equal(response.status, 204);
});
