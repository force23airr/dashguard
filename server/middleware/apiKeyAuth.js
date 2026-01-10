import ApiKey from '../models/ApiKey.js';

// API Key authentication middleware for external integrations
const apiKeyAuth = async (req, res, next) => {
  try {
    // Get API key from Authorization header
    // Format: Authorization: Bearer API_KEY:API_SECRET
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required. Use Authorization: Bearer API_KEY:API_SECRET'
      });
    }

    const credentials = authHeader.replace('Bearer ', '');
    const [key, secret] = credentials.split(':');

    if (!key || !secret) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key format. Use API_KEY:API_SECRET'
      });
    }

    // Find API key
    const apiKey = await ApiKey.findOne({ key }).select('+secretHash');

    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
    }

    // Check if key is active
    if (!apiKey.isValid()) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is inactive or expired'
      });
    }

    // Verify secret
    if (!apiKey.verifySecret(secret)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API secret'
      });
    }

    // Check IP whitelist if configured
    if (apiKey.allowedIPs && apiKey.allowedIPs.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      const normalizedIP = clientIP.replace('::ffff:', '');

      if (!apiKey.allowedIPs.includes(normalizedIP) && !apiKey.allowedIPs.includes(clientIP)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'IP address not allowed'
        });
      }
    }

    // Increment usage stats (async, don't wait)
    apiKey.incrementUsage().catch(err => console.error('Failed to increment API key usage:', err));

    // Attach API key to request
    req.apiKey = apiKey;
    next();
  } catch (error) {
    console.error('API Key Auth Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

// Permission check middleware factory
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required'
      });
    }

    if (!req.apiKey.permissions[permission]) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Permission '${permission}' is required for this operation`
      });
    }

    next();
  };
};

export { apiKeyAuth, requirePermission };
export default apiKeyAuth;
