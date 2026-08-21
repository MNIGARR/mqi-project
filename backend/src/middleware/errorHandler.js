function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  res.status(status).json({
    message,
  });
}

module.exports = { errorHandler };
