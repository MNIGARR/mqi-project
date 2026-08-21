const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

async function login(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email) || !password || password.length < 8) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await req.db.query(
      'SELECT id, email, password_hash, name FROM admins WHERE email = $1',
      [email]
    );

    const admin = result.rows[0];
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signAdminToken(admin);
    return res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentAdmin(req, res) {
  return res.json({
    id: req.admin.id,
    email: req.admin.email,
    name: req.admin.name,
  });
}

module.exports = { login, getCurrentAdmin };
