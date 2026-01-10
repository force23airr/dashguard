import rateLimit from 'express-rate-limit';

// In-memory store for API key rate limiting
const apiKeyUsage = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of apiKeyUsage.entries()) {
    if (now - data.windowStart > 60000) {
      apiKeyUsage.delete(key);
    }
  }
}, 60000);

// General rate limiter for public endpoints
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// API rate limiter based on API key settings
export const apiKeyLimiter = (req, res, next) => {
  if (!req.apiKey) {
    return next();
  }

  const key = req.apiKey.key;
  const limit = req.apiKey.rateLimit?.requestsPerMinute || 60;
  const now = Date.now();

  let usage = apiKeyUsage.get(key);

  if (!usage || now - usage.windowStart > 60000) {
    // New window
    usage = {
      windowStart: now,
      count: 1
    };
    apiKeyUsage.set(key, usage);
  } else {
    usage.count++;
  }

  // Calculate remaining
  const remaining = Math.max(0, limit - usage.count);
  const resetTime = Math.ceil((usage.windowStart + 60000 - now) / 1000);

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': limit,
    'X-RateLimit-Remaining': remaining,
    'X-RateLimit-Reset': resetTime
  });

  if (usage.count > limit) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Limit: ${limit} requests per minute`,
      retryAfter: resetTime
    });
  }

  next();
};

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    error: 'Too Many Requests',
    message: 'Too many uploads, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Export job rate limiter
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 exports per hour
  message: {
    error: 'Too Many Requests',
    message: 'Too many export requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  generalLimiter,
  authLimiter,
  apiKeyLimiter,
  uploadLimiter,
  exportLimiter
};
