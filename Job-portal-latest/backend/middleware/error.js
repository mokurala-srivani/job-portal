const notFound = (req, res, next) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({
    message: err.message || 'Server error',
    ...(err.errors ? { errors: err.errors } : {}),
  });
};

module.exports = { notFound, errorHandler };
