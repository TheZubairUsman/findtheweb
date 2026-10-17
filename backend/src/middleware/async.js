/**
 * Async middleware wrapper for route handlers
 * Catches errors in async route handlers and passes them to Express's error handler
 * @param {Function} fn - The async route handler function
 * @returns {Function} A middleware function that handles async operations
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
