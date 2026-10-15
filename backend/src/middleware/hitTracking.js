const Hit = require('../models/Hit');
const Website = require('../models/Website');
const crypto = require('crypto');
const asyncHandler = require('./async');

// Rate limiting cache (in production, use Redis)
const hitCache = new Map();

// Clean cache every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of hitCache.entries()) {
    if (now - timestamp > 15 * 60 * 1000) { // 15 minutes
      hitCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Hash IP address for privacy
 * @param {string} ip - IP address
 * @param {string} salt - Salt for hashing
 * @returns {string} - Hashed IP
 */
const hashIP = (ip, salt = 'website_hits') => {
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
};

/**
 * Extract real IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
const getRealIP = (req) => {
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.ip
  );
};

/**
 * Check if hit should be rate limited
 * @param {string} websiteId - Website ID
 * @param {string} ipHash - Hashed IP address
 * @returns {boolean} - True if should be rate limited
 */
const shouldRateLimit = (websiteId, ipHash) => {
  const key = `${websiteId}:${ipHash}`;
  const lastHit = hitCache.get(key);
  const now = Date.now();
  
  // Rate limit: 1 hit per 15 minutes per IP per website
  if (lastHit && (now - lastHit) < 15 * 60 * 1000) {
    return true;
  }
  
  hitCache.set(key, now);
  return false;
};

/**
 * Middleware to automatically track hits on website routes
 * Usage: Add this middleware to routes that should track hits
 */
const autoTrackHit = asyncHandler(async (req, res, next) => {
  // Only track hits on GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Skip if no website ID in params
  if (!req.params.id && !req.params.websiteId) {
    return next();
  }

  const websiteId = req.params.id || req.params.websiteId;
  const ip = getRealIP(req);
  const ipHash = hashIP(ip);

  // Check rate limiting
  if (shouldRateLimit(websiteId, ipHash)) {
    return next(); // Continue without tracking hit
  }

  try {
    // Verify website exists
    const website = await Website.findByPk(websiteId);
    if (!website) {
      return next();
    }

    // Create hit record
    await Hit.create({
      websiteId,
      ipHash,
      userAgent: req.get('User-Agent') || 'Unknown',
      referrer: req.get('Referer') || req.get('Referrer') || null,
    });

    // Update website hit counters (async, don't wait)
    website.incrementHits().catch(err => {
      console.error('Error incrementing website hits:', err);
    });

  } catch (error) {
    console.error('Error tracking hit:', error);
    // Don't fail the request if hit tracking fails
  }

  next();
});

/**
 * Middleware to track hits with manual website ID
 * Usage: trackHitForWebsite(websiteId)
 */
const trackHitForWebsite = (websiteId) => {
  return asyncHandler(async (req, res, next) => {
    const ip = getRealIP(req);
    const ipHash = hashIP(ip);

    // Check rate limiting
    if (shouldRateLimit(websiteId, ipHash)) {
      return next();
    }

    try {
      // Create hit record
      await Hit.create({
        websiteId,
        ipHash,
        userAgent: req.get('User-Agent') || 'Unknown',
        referrer: req.get('Referer') || req.get('Referrer') || null,
      });

      // Update website hit counters
      const website = await Website.findByPk(websiteId);
      if (website) {
        await website.incrementHits();
      }

    } catch (error) {
      console.error('Error tracking hit:', error);
    }

    next();
  });
};

/**
 * Get hit statistics for a website
 * @param {string} websiteId - Website ID
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Object} - Hit statistics
 */
const getHitStats = async (websiteId, days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const hits = await Hit.findAll({
    where: {
      websiteId,
      createdAt: {
        [Hit.sequelize.Op.gte]: startDate,
      },
    },
    attributes: [
      [Hit.sequelize.fn('DATE', Hit.sequelize.col('created_at')), 'date'],
      [Hit.sequelize.fn('COUNT', Hit.sequelize.col('id')), 'count'],
    ],
    group: [Hit.sequelize.fn('DATE', Hit.sequelize.col('created_at'))],
    order: [[Hit.sequelize.fn('DATE', Hit.sequelize.col('created_at')), 'ASC']],
  });

  const totalHits = await Hit.count({
    where: {
      websiteId,
      createdAt: {
        [Hit.sequelize.Op.gte]: startDate,
      },
    },
  });

  const uniqueVisitors = await Hit.count({
    where: {
      websiteId,
      createdAt: {
        [Hit.sequelize.Op.gte]: startDate,
      },
    },
    distinct: true,
    col: 'ipHash',
  });

  return {
    totalHits,
    uniqueVisitors,
    dailyHits: hits,
    period: `${days} days`,
  };
};

module.exports = {
  autoTrackHit,
  trackHitForWebsite,
  getHitStats,
  hashIP,
  getRealIP,
};
