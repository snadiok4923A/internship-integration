module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON payload'
      }
    });
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'SERVER_ERROR';
  const message = err.message || 'Unexpected server error';

  const response = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (err.details && Array.isArray(err.details)) {
    response.error.details = err.details;
  }

  return res.status(statusCode).json(response);
};
