// 404 handler for unknown routes.
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Central error handler. Every controller error ends up here.
const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors;

  // Invalid MongoDB ObjectId
  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  }

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(error.errors).map((item) => item.message);
    message = 'Validation failed';
  }

  // Duplicate key (unique email)
  if (error.code === 11000) {
    statusCode = 400;
    message = 'A student with this email already exists';
    errors = ['A student with this email already exists'];
  }

  // Malformed JSON body
  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  if (statusCode >= 500) {
    console.error(error);

    // Do not expose internal error details in production responses.
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = { notFound, errorHandler };
