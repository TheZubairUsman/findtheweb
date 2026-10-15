/**
 * Response Formatter Middleware
 * Standardizes API response format across all endpoints
 */

const responseFormatter = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to format responses
  res.json = function(data) {
    // If response is already formatted, return as is
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson.call(this, data);
    }

    // Format successful responses
    const formattedResponse = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      requestId: req.id || req.headers['x-request-id'] || 'unknown',
    };

    return originalJson.call(this, formattedResponse);
  };

  // Store original status method
  const originalStatus = res.status;

  // Override status method to handle error responses
  res.status = function(code) {
    const statusResponse = originalStatus.call(this, code);

    // Override json method for error responses
    statusResponse.json = function(errorData) {
      const formattedError = {
        success: false,
        error: {
          message: errorData.message || 'An error occurred',
          code: code,
          details: errorData.details || null,
          timestamp: new Date().toISOString(),
          requestId: req.id || req.headers['x-request-id'] || 'unknown',
        },
      };

      // Include stack trace in development
      if (process.env.NODE_ENV === 'development' && errorData.stack) {
        formattedError.error.stack = errorData.stack;
      }

      return originalJson.call(this, formattedError);
    };

    return statusResponse;
  };

  next();
};

module.exports = responseFormatter;
