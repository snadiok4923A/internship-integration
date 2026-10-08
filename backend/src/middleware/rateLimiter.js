const WINDOW_MS = 15 * 60 * 1000;
const stores = new Map();

function createRateLimiter(maxRequests, label) {
  return function rateLimiter(req, res, next) {
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${label}:${ipAddress}`;
    const current = stores.get(key) || { count: 0, resetAt: now + WINDOW_MS };

    if (now >= current.resetAt) {
      current.count = 0;
      current.resetAt = now + WINDOW_MS;
    }

    current.count += 1;
    stores.set(key, current);

    if (current.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.'
        }
      });
    }

    return next();
  };
}

const apiLimiter = createRateLimiter(100, 'api');
const applicationLimiter = createRateLimiter(10, 'application');

module.exports = { apiLimiter, applicationLimiter };
