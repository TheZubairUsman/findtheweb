const { User, Admin } = require('../models');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'findtheweb-test-only-secret' : undefined);
const JWT_ISSUER = process.env.JWT_ISSUER || 'findtheweb-admin';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'findtheweb-admin-ui';

/**
 * Middleware to authenticate requests using JWT
 */
const authenticateJWT = (req, res, next) => {
  return protect(req, res, next);
};

/**
 * Middleware to check if user has required roles
 * @param {...string} roles - List of allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

/**
 * Middleware to check if the user is the owner of the resource
 * @param {string} modelName - Name of the model to check ownership
 * @param {string} [idParam='id'] - Name of the ID parameter in the request
 * @param {string} [userIdField='userId'] - Name of the user ID field in the model
 * @returns {Function} Express middleware function
 */
const checkOwnership = (modelName, idParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      const Model = require(`../models/${modelName}`);
      const resource = await Model.findByPk(req.params[idParam]);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check if the user owns the resource
      if (resource[userIdField] !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
        });
      }

      // Attach resource to request object for use in the route handler
      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      next(error);
    }
  };
};

/**
 * Middleware to check if user has verified their email
 */
const checkEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address before performing this action',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
};

/**
 * Middleware to check if 2FA is enabled and verified
 */
const check2FA = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Skip 2FA check if not enabled for the user
  if (!req.user.twoFAEnabled) {
    return next();
  }

  // Check if 2FA was verified in this session
  if (!req.session?.twoFAPassed) {
    return res.status(403).json({
      success: false,
      message: 'Two-factor authentication required',
      requires2FA: true,
    });
  }

  next();
};

/**
 * Middleware to log all requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, user } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = user?.id || 'anonymous';
    
    logger.info(
      `${method} ${originalUrl} - ${res.statusCode} - ${duration}ms - ${ip} - User: ${userId}`
    );
    
    // Log request body for debugging (except sensitive data)
    if (process.env.NODE_ENV !== 'production' && Object.keys(req.body).length > 0) {
      const logBody = { ...req.body };
      
      // Redact sensitive fields
      ['password', 'newPassword', 'currentPassword', 'token', 'refreshToken'].forEach(field => {
        if (logBody[field]) {
          logBody[field] = '***REDACTED***';
        }
      });
      
      logger.debug('Request body:', logBody);
    }
  });
  
  next();
};

// Protect routes - requires authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token with issuer and audience validation
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      
      // Check if this is an admin token
      // Admin login tokens historically used either `isAdmin: true` or
      // `role: 'admin'`. Accept both forms so protected community/admin
      // routes do not misclassify a valid admin token as a regular user.
      if (decoded.isAdmin || decoded.role === 'admin') {
        const admin = await Admin.findByPk(decoded.id, {
          attributes: { exclude: ['password'] },
        });

        if (!admin) {
          return res.status(404).json({
            success: false,
            message: 'Admin not found'
          });
        }

        // Check if admin is active
        if (!admin.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Admin account is not active'
          });
        }

        // Check if admin account is locked
        if (admin.isLocked()) {
          return res.status(403).json({
            success: false,
            message: 'Admin account is locked'
          });
        }

        // Add admin to request object with role
        req.user = { ...admin.toJSON(), role: 'admin' };
      } else {
        // Regular user authentication
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password', 'twoFASecret'] },
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Check if user account is active
        if (!user.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Account is not active'
          });
        }

        req.user = user;
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Grant access to specific roles
const grantAccess = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is the owner of the resource
const checkResourceOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findByPk(req.params.id);
      
      if (!resource) {
        return next(
          new ErrorResponse(
            `Resource not found with id of ${req.params.id}`,
            404
          )
        );
      }

      // Check if user is resource owner or admin
      if (resource.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to update this resource`,
            401
          )
        );
      }

      // If we get here, the user is authorized
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Check if user is authenticated (for optional auth)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    try {
      // Verify token with issuer and audience validation
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      
      // Check if this is an admin token
      if (decoded.isAdmin) {
        const admin = await Admin.findByPk(decoded.id, {
          attributes: { exclude: ['password'] },
        });

        // If admin is found and active, proceed
        if (admin && admin.isActive && !admin.isLocked()) {
          req.user = { ...admin.toJSON(), role: 'admin' };
          req.isAuthenticated = true;
        }
      } else {
        // Regular user authentication
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password', 'twoFASecret'] },
        });

        // If user is found and active, proceed
        if (user && user.isActive) {
          req.user = user;
          req.isAuthenticated = true;
        }
      }

      next();
    } catch (err) {
      // If token is invalid, just continue without setting req.user
      next();
    }
  } catch (err) {
    next();
  }
};

/**
 * Centralized Admin Authentication Middleware
 * Consolidates duplicate middleware from index.js and admin.js
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required',
        });
      }
      
      // Find admin by ID from token
      const admin = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Admin not found.'
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is not active'
        });
      }

      // Check if admin account is locked
      if (admin.isLocked()) {
        const lockUntil = new Date(admin.lockUntil);
        return res.status(423).json({
          success: false,
          message: `Admin account is locked until ${lockUntil.toISOString()}`,
          lockUntil: lockUntil.toISOString()
        });
      }

      // Add admin to request object with role
      req.user = { ...admin.toJSON(), role: 'admin' };
      next();
    } catch (jwtError) {
      let message = 'Invalid token';
      
      if (jwtError.name === 'TokenExpiredError') {
        message = 'Token expired. Please log in again.';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = 'Invalid token format';
      } else if (jwtError.name === 'NotBeforeError') {
        message = 'Token not active yet';
      }
      
      return res.status(401).json({
        success: false,
        message,
        code: jwtError.name
      });
    }
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication server error'
    });
  }
};

module.exports = {
  authenticateJWT,
  authorize,
  checkOwnership,
  checkEmailVerified,
  check2FA,
  requestLogger,
  protect,
  grantAccess,
  checkResourceOwnership,
  optionalAuth,
  authenticateAdmin, // Export centralized admin auth middleware
};
