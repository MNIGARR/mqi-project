function validateKey(key) {
  const normalized = typeof key === 'string' ? key.trim() : '';
  if (!normalized || !/^[a-z0-9_-]{1,64}$/i.test(normalized)) {
    const error = new Error('Content key is invalid');
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

async function listContent(req, res, next) {
  try {
    const result = await req.db.query(
      'SELECT key, value, updated_at FROM content ORDER BY key ASC'
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getContentByKey(req, res, next) {
  try {
    const key = validateKey(req.params.key);
    const result = await req.db.query(
      'SELECT key, value, updated_at FROM content WHERE key = $1',
      [key]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Content not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function updateContent(req, res, next) {
  try {
    const key = validateKey(req.params.key);
    const value = req.body && Object.prototype.hasOwnProperty.call(req.body, 'value') ? req.body.value : undefined;

    if (typeof value !== 'string' || !value.trim()) {
      const error = new Error('value is required and must be a non-empty string');
      error.statusCode = 400;
      throw error;
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 20000) {
      const error = new Error('value is too long');
      error.statusCode = 400;
      throw error;
    }

    const existing = await req.db.query('SELECT key FROM content WHERE key = $1', [key]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const result = await req.db.query(
      'UPDATE content SET value = $1 WHERE key = $2 RETURNING key, value, updated_at',
      [trimmedValue, key]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

module.exports = {
  listContent,
  getContentByKey,
  updateContent,
};
