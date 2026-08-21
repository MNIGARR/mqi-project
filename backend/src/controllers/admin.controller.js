async function getStats(req, res, next) {
  try {
    const stats = await req.db.query(
      `SELECT
        (SELECT COUNT(*)::int FROM events) AS events,
        (SELECT COUNT(*)::int FROM products) AS products,
        (SELECT COUNT(*)::int FROM services) AS services,
        (SELECT COUNT(*)::int FROM categories) AS categories`
    );
    return res.json(stats.rows[0] || { events: 0, products: 0, services: 0, categories: 0 });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getStats };
