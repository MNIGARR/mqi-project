const jwt = require('jsonwebtoken');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || typeof header !== 'string') {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await req.db.query(
      'SELECT id, email, name FROM admins WHERE id = $1',
      [payload.sub || payload.id]
    );

    if (!admin.rows.length) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.admin = admin.rows[0];
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    return next(error);
  }
}

module.exports = { requireAuth };
