function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    details: err.details || undefined
  });
}

module.exports = { notFound, errorHandler };
