const SERVICE_SELECT = `
  SELECT s.id, s.name, s.description, s.price, s.created_at, s.updated_at,
         c.id AS category_id, c.name AS category_name
  FROM services s
  LEFT JOIN categories c ON c.id = s.category_id
`;

const FIELD_TO_COLUMN = {
  name: 'name',
  description: 'description',
  price: 'price',
  categoryId: 'category_id',
};

function mapServiceRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category_id ? { id: row.category_id, name: row.category_name } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseId(rawId) {
  const trimmed = String(rawId).trim();
  if (!/^\d+$/.test(trimmed)) {
    const error = new Error('Service ID must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  const id = Number(trimmed);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('Service ID must be a positive integer');
    error.statusCode = 400;
    throw error;
  }
  return id;
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveInt(rawValue) {
  const trimmed = String(rawValue).trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function validateServiceInput(body, { requireName = false } = {}) {
  const service = {};

  if (requireName || Object.prototype.hasOwnProperty.call(body, 'name')) {
    const name = trimString(body.name);
    if (!name) {
      const error = new Error('name is required');
      error.statusCode = 400;
      throw error;
    }
    if (name.length > 255) {
      const error = new Error('name must be 255 characters or fewer');
      error.statusCode = 400;
      throw error;
    }
    service.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    const description = body.description == null ? null : trimString(body.description);
    if (description !== null && description.length > 10000) {
      const error = new Error('description is too long');
      error.statusCode = 400;
      throw error;
    }
    service.description = description;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'price')) {
    const rawPrice = body.price;
    if (rawPrice === null) {
      service.price = null;
    } else {
      const price = Number(rawPrice);
      if (typeof rawPrice === 'boolean' || rawPrice === '' || !Number.isFinite(price) || price < 0) {
        const error = new Error('price must be a non-negative number');
        error.statusCode = 400;
        throw error;
      }
      service.price = price;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'categoryId')) {
    const rawCategoryId = body.categoryId;
    if (rawCategoryId === null) {
      service.categoryId = null;
    } else {
      const categoryId = parsePositiveInt(rawCategoryId);
      if (categoryId === null) {
        const error = new Error('categoryId must be a positive integer');
        error.statusCode = 400;
        throw error;
      }
      service.categoryId = categoryId;
    }
  }

  return service;
}

async function ensureCategoryExists(db, categoryId) {
  if (categoryId === undefined || categoryId === null) {
    return;
  }
  const result = await db.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
  if (!result.rows.length) {
    const error = new Error('categoryId does not reference an existing category');
    error.statusCode = 404;
    throw error;
  }
}

async function fetchServiceById(db, id) {
  const result = await db.query(`${SERVICE_SELECT} WHERE s.id = $1`, [id]);
  return result.rows.length ? mapServiceRow(result.rows[0]) : null;
}

async function listServices(req, res, next) {
  try {
    const result = await req.db.query(`${SERVICE_SELECT} ORDER BY s.created_at DESC, s.id DESC`);
    return res.json(result.rows.map(mapServiceRow));
  } catch (error) {
    return next(error);
  }
}

async function getServiceById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const service = await fetchServiceById(req.db, id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    return res.json(service);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function createService(req, res, next) {
  try {
    const payload = validateServiceInput(req.body || {}, { requireName: true });
    await ensureCategoryExists(req.db, payload.categoryId);

    const inserted = await req.db.query(
      'INSERT INTO services (name, description, price, category_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [payload.name, payload.description ?? null, payload.price ?? null, payload.categoryId ?? null]
    );

    const service = await fetchServiceById(req.db, inserted.rows[0].id);
    return res.status(201).json(service);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ message: 'categoryId does not reference an existing category' });
    }
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const payload = validateServiceInput(req.body || {});

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    await ensureCategoryExists(req.db, payload.categoryId);

    const existing = await req.db.query('SELECT id FROM services WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const assignments = [];
    const values = [];
    for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        assignments.push(`${column} = $${values.length + 1}`);
        values.push(payload[field]);
      }
    }

    values.push(id);
    await req.db.query(`UPDATE services SET ${assignments.join(', ')} WHERE id = $${values.length}`, values);

    const service = await fetchServiceById(req.db, id);
    return res.json(service);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ message: 'categoryId does not reference an existing category' });
    }
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function deleteService(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await req.db.query('DELETE FROM services WHERE id = $1', [id]);

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Service not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

module.exports = {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
