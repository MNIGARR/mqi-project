const MAX_NAME_LENGTH = 255;

function parseId(rawId) {
  const trimmed = String(rawId).trim();
  if (!/^\d+$/.test(trimmed)) {
    const error = new Error('Category ID must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  const id = Number(trimmed);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('Category ID must be a positive integer');
    error.statusCode = 400;
    throw error;
  }
  return id;
}

function validateName(rawName) {
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (!name) {
    const error = new Error('name is required');
    error.statusCode = 400;
    throw error;
  }
  if (name.length > MAX_NAME_LENGTH) {
    const error = new Error(`name must be ${MAX_NAME_LENGTH} characters or fewer`);
    error.statusCode = 400;
    throw error;
  }
  return name;
}

async function listCategories(req, res, next) {
  try {
    const result = await req.db.query(
      'SELECT id, name, created_at FROM categories ORDER BY name ASC'
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await req.db.query(
      'SELECT id, name, created_at FROM categories WHERE id = $1',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const name = validateName(req.body?.name);
    const result = await req.db.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name, created_at',
      [name]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A category with this name already exists' });
    }
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const name = validateName(req.body?.name);

    const existing = await req.db.query('SELECT id FROM categories WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const result = await req.db.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name, created_at',
      [name, id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A category with this name already exists' });
    }
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await req.db.query('DELETE FROM categories WHERE id = $1', [id]);

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
