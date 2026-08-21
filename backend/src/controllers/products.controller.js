const PRODUCT_SELECT = `
  SELECT p.id, p.name, p.description, p.price, p.image_url, p.created_at, p.updated_at,
         c.id AS category_id, c.name AS category_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

const FIELD_TO_COLUMN = {
  name: 'name',
  description: 'description',
  price: 'price',
  categoryId: 'category_id',
  imageUrl: 'image_url',
};

function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    category: row.category_id ? { id: row.category_id, name: row.category_name } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseId(rawId) {
  const trimmed = String(rawId).trim();
  if (!/^\d+$/.test(trimmed)) {
    const error = new Error('Product ID must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  const id = Number(trimmed);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('Product ID must be a positive integer');
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

function validateProductInput(body, { requireName = false } = {}) {
  const product = {};

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
    product.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    const description = body.description == null ? null : trimString(body.description);
    if (description !== null && description.length > 10000) {
      const error = new Error('description is too long');
      error.statusCode = 400;
      throw error;
    }
    product.description = description;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'price')) {
    const rawPrice = body.price;
    if (rawPrice === null) {
      product.price = null;
    } else {
      const price = Number(rawPrice);
      if (typeof rawPrice === 'boolean' || rawPrice === '' || !Number.isFinite(price) || price < 0) {
        const error = new Error('price must be a non-negative number');
        error.statusCode = 400;
        throw error;
      }
      product.price = price;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'categoryId')) {
    const rawCategoryId = body.categoryId;
    if (rawCategoryId === null) {
      product.categoryId = null;
    } else {
      const categoryId = parsePositiveInt(rawCategoryId);
      if (categoryId === null) {
        const error = new Error('categoryId must be a positive integer');
        error.statusCode = 400;
        throw error;
      }
      product.categoryId = categoryId;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'imageUrl')) {
    const imageUrl = body.imageUrl == null ? null : trimString(body.imageUrl);
    if (imageUrl !== null && imageUrl.length > 2048) {
      const error = new Error('imageUrl is too long');
      error.statusCode = 400;
      throw error;
    }
    product.imageUrl = imageUrl;
  }

  return product;
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

async function fetchProductById(db, id) {
  const result = await db.query(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
  return result.rows.length ? mapProductRow(result.rows[0]) : null;
}

async function listProducts(req, res, next) {
  try {
    const result = await req.db.query(`${PRODUCT_SELECT} ORDER BY p.created_at DESC, p.id DESC`);
    return res.json(result.rows.map(mapProductRow));
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const product = await fetchProductById(req.db, id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const payload = validateProductInput(req.body || {}, { requireName: true });
    await ensureCategoryExists(req.db, payload.categoryId);

    const inserted = await req.db.query(
      'INSERT INTO products (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [payload.name, payload.description ?? null, payload.price ?? null, payload.categoryId ?? null, payload.imageUrl ?? null]
    );

    const product = await fetchProductById(req.db, inserted.rows[0].id);
    return res.status(201).json(product);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ message: 'categoryId does not reference an existing category' });
    }
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const payload = validateProductInput(req.body || {});

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    await ensureCategoryExists(req.db, payload.categoryId);

    const existing = await req.db.query('SELECT id FROM products WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Product not found' });
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
    await req.db.query(`UPDATE products SET ${assignments.join(', ')} WHERE id = $${values.length}`, values);

    const product = await fetchProductById(req.db, id);
    return res.json(product);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(404).json({ message: 'categoryId does not reference an existing category' });
    }
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await req.db.query('DELETE FROM products WHERE id = $1', [id]);

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
