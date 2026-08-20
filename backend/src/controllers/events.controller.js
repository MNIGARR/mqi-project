function parseId(rawId) {
  const trimmed = String(rawId).trim();
  if (!/^\d+$/.test(trimmed)) {
    const error = new Error('Event ID must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  const id = Number(trimmed);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('Event ID must be a positive integer');
    error.statusCode = 400;
    throw error;
  }
  return id;
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateEventInput(body, { requireTitle = false } = {}) {
  const event = {};

  if (requireTitle || Object.prototype.hasOwnProperty.call(body, 'title')) {
    const title = trimString(body.title);
    if (!title) {
      const error = new Error('Title is required');
      error.statusCode = 400;
      throw error;
    }
    if (title.length > 255) {
      const error = new Error('Title must be 255 characters or fewer');
      error.statusCode = 400;
      throw error;
    }
    event.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    const description = body.description == null ? null : trimString(body.description);
    if (description !== null && description.length > 10000) {
      const error = new Error('Description is too long');
      error.statusCode = 400;
      throw error;
    }
    event.description = description;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'event_date')) {
    const eventDate = body.event_date;
    if (eventDate === undefined || eventDate === null || eventDate === '') {
      const error = new Error('event_date is required');
      error.statusCode = 400;
      throw error;
    }
    const date = new Date(eventDate);
    if (Number.isNaN(date.getTime())) {
      const error = new Error('event_date must be a valid ISO date string');
      error.statusCode = 400;
      throw error;
    }
    event.event_date = eventDate;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'location')) {
    const location = body.location == null ? null : trimString(body.location);
    if (location !== null && location.length > 255) {
      const error = new Error('Location must be 255 characters or fewer');
      error.statusCode = 400;
      throw error;
    }
    event.location = location;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'image_url')) {
    const imageUrl = body.image_url == null ? null : trimString(body.image_url);
    if (imageUrl !== null && imageUrl.length > 2048) {
      const error = new Error('image_url is too long');
      error.statusCode = 400;
      throw error;
    }
    event.image_url = imageUrl;
  }

  return event;
}

async function listEvents(req, res, next) {
  try {
    const result = await req.db.query(
      'SELECT id, title, description, event_date, location, image_url, created_at, updated_at FROM events ORDER BY event_date ASC, id ASC'
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await req.db.query(
      'SELECT id, title, description, event_date, location, image_url, created_at, updated_at FROM events WHERE id = $1',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const payload = validateEventInput(req.body || {}, { requireTitle: true });

    if (!payload.event_date) {
      const error = new Error('event_date is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await req.db.query(
      'INSERT INTO events (title, description, event_date, location, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, event_date, location, image_url, created_at, updated_at',
      [payload.title, payload.description ?? null, payload.event_date, payload.location ?? null, payload.image_url ?? null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const payload = validateEventInput(req.body || {});

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const existing = await req.db.query('SELECT id FROM events WHERE id = $1', [id]);
    if (!existing.rows.length) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const assignments = [];
    const values = [];
    const allowedFields = ['title', 'description', 'event_date', 'location', 'image_url'];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        assignments.push(`${field} = $${values.length + 1}`);
        values.push(payload[field]);
      }
    }

    if (!assignments.length) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(id);
    const result = await req.db.query(
      `UPDATE events SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING id, title, description, event_date, location, image_url, created_at, updated_at`,
      values
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await req.db.query('DELETE FROM events WHERE id = $1', [id]);

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return error.statusCode ? res.status(error.statusCode).json({ message: error.message }) : next(error);
  }
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
