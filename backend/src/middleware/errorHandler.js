const { NODE_ENV } = process.env;
const ErrorResponse = require('../utils/errorResponse');
const { logger } = require('../utils/logger');

const redact = (value) => {
  if (!value || typeof value !== 'object') return value;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  for (const key of Object.keys(copy)) {
    if (/password|token|secret|authorization|cookie|api[-_]?key/i.test(key)) {
      copy[key] = '[REDACTED]';
    } else if (copy[key] && typeof copy[key] === 'object') {
      copy[key] = redact(copy[key]);
    }
  }
  return copy;
};

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: redact(req.body),
    params: redact(req.params),
    query: redact(req.query),
    user: req.user ? req.user.id : 'unauthenticated',
  });

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const error = new ErrorResponse('Invalid token', 401, {}, 'INVALID_TOKEN', 'AUTH_ERROR');
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    const error = new ErrorResponse('Token expired', 401, {}, 'TOKEN_EXPIRED', 'AUTH_ERROR');
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle validation errors (e.g., from express-validator)
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    const messages = [];
    const details = {};

    // Handle Sequelize validation errors
    if (err.errors) {
      err.errors.forEach((error) => {
        messages.push(error.message);
        details[error.path] = error.message;
      });
    } else if (err.details) {
      // Handle Joi validation errors
      err.details.forEach((error) => {
        messages.push(error.message);
        details[error.context.key] = error.message;
      });
    }

    const error = ErrorResponse.validationError(
      'Validation Error',
      { errors: details }
    );
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle duplicate key errors (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    const error = ErrorResponse.conflict(message, { [field]: message });
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    const message = `Duplicate field value: ${field}`;
    const error = ErrorResponse.conflict(message, { [field]: message });
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle CastError (MongoDB)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    const error = ErrorResponse.notFound(message);
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    const error = ErrorResponse.badRequest(err.message, { field: err.field });
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle custom ErrorResponse
  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle other errors
  const error = ErrorResponse.fromError(err);
  
  // In production, don't leak error details
  if (NODE_ENV === 'production' && error.statusCode === 500) {
    error.message = 'Internal Server Error';
    error.details = {};
  }

  // Send the error response
  res.status(error.statusCode).json(error.toJSON());
};

/**
 * 404 handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const error = ErrorResponse.notFound(`Not Found - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
