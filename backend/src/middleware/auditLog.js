const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const asyncHandler = require('./async');

// Audit log configuration
const AUDIT_LOG_DIR = process.env.AUDIT_LOG_DIR || path.join(__dirname, '../../logs');
const AUDIT_LOG_FILE = path.join(AUDIT_LOG_DIR, 'audit.log');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 5;

/**
 * Ensure audit log directory exists
 */
const ensureLogDirectory = async () => {
  try {
    await fs.access(AUDIT_LOG_DIR);
  } catch (error) {
    await fs.mkdir(AUDIT_LOG_DIR, { recursive: true });
  }
};

/**
 * Rotate log files when they get too large
 */
const rotateLogFile = async () => {
  try {
    const stats = await fs.stat(AUDIT_LOG_FILE);
    if (stats.size > MAX_LOG_SIZE) {
      // Rotate existing files
      for (let i = MAX_LOG_FILES - 1; i > 0; i--) {
        const oldFile = `${AUDIT_LOG_FILE}.${i}`;
        const newFile = `${AUDIT_LOG_FILE}.${i + 1}`;
        
        try {
          await fs.access(oldFile);
          if (i === MAX_LOG_FILES - 1) {
            await fs.unlink(oldFile); // Delete oldest file
          } else {
            await fs.rename(oldFile, newFile);
          }
        } catch (error) {
          // File doesn't exist, continue
        }
      }
      
      // Move current log to .1
      await fs.rename(AUDIT_LOG_FILE, `${AUDIT_LOG_FILE}.1`);
    }
  } catch (error) {
    // Log file doesn't exist yet, no need to rotate
  }
};

/**
 * Hash sensitive data for logging
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
const hashSensitiveData = (data) => {
  if (!data) return null;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
};

/**
 * Get real IP address from request
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
 * Sanitize request body for logging (remove sensitive fields)
 * @param {Object} body - Request body
 * @returns {Object} - Sanitized body
 */
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

/**
 * Create audit log entry
 * @param {Object} logData - Log data object
 */
const writeAuditLog = async (logData) => {
  try {
    await ensureLogDirectory();
    await rotateLogFile();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...logData,
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(AUDIT_LOG_FILE, logLine);
    
  } catch (error) {
    console.error('Error writing audit log:', error);
  }
};

/**
 * Middleware to log all admin actions
 */
const auditAdminActions = asyncHandler(async (req, res, next) => {
  // Only log if user is authenticated and is admin
  if (!req.user || req.user.role !== 'admin') {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;
  
  // Capture response
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log the action
    writeAuditLog({
      type: 'admin_action',
      userId: req.user.id,
      userEmail: req.user.email,
      action: `${req.method} ${req.originalUrl}`,
      ip: hashSensitiveData(getRealIP(req)),
      userAgent: req.get('User-Agent'),
      requestBody: sanitizeBody(req.body),
      statusCode: res.statusCode,
      duration,
      params: req.params,
      query: req.query,
    });
    
    originalSend.call(this, data);
  };
  
  next();
});

/**
 * Log authentication events
 * @param {string} event - Event type (login, logout, failed_login, etc.)
 * @param {Object} user - User object (optional)
 * @param {Object} req - Request object
 * @param {Object} additional - Additional data
 */
const logAuthEvent = async (event, user, req, additional = {}) => {
  await writeAuditLog({
    type: 'auth_event',
    event,
    userId: user ? user.id : null,
    userEmail: user ? user.email : null,
    ip: hashSensitiveData(getRealIP(req)),
    userAgent: req.get('User-Agent'),
    ...additional,
  });
};

/**
 * Log data modification events
 * @param {string} action - Action type (create, update, delete)
 * @param {string} resource - Resource type (website, post, comment, etc.)
 * @param {string} resourceId - Resource ID
 * @param {Object} user - User object
 * @param {Object} changes - Changes made (for updates)
 */
const logDataEvent = async (action, resource, resourceId, user, changes = null) => {
  await writeAuditLog({
    type: 'data_event',
    action,
    resource,
    resourceId,
    userId: user ? user.id : null,
    userEmail: user ? user.email : null,
    changes: changes ? sanitizeBody(changes) : null,
  });
};

/**
 * Log system events
 * @param {string} event - Event type
 * @param {string} message - Event message
 * @param {Object} data - Additional data
 */
const logSystemEvent = async (event, message, data = {}) => {
  await writeAuditLog({
    type: 'system_event',
    event,
    message,
    ...data,
  });
};

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} req - Request object
 * @param {string} message - Event message
 * @param {Object} additional - Additional data
 */
const logSecurityEvent = async (event, req, message, additional = {}) => {
  await writeAuditLog({
    type: 'security_event',
    event,
    message,
    ip: hashSensitiveData(getRealIP(req)),
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    ...additional,
  });
};

/**
 * Middleware to log failed authentication attempts
 */
const auditFailedAuth = asyncHandler(async (req, res, next) => {
  const originalStatus = res.status;
  
  res.status = function(code) {
    if (code === 401 || code === 403) {
      logSecurityEvent(
        'failed_auth',
        req,
        `Authentication failed: ${code}`,
        {
          email: req.body.email || null,
          statusCode: code,
        }
      );
    }
    return originalStatus.call(this, code);
  };
  
  next();
});

/**
 * Get audit logs with filtering
 * @param {Object} filters - Filter options
 * @returns {Array} - Array of log entries
 */
const getAuditLogs = async (filters = {}) => {
  try {
    const logs = [];
    const files = [AUDIT_LOG_FILE];
    
    // Add rotated log files
    for (let i = 1; i <= MAX_LOG_FILES; i++) {
      const rotatedFile = `${AUDIT_LOG_FILE}.${i}`;
      try {
        await fs.access(rotatedFile);
        files.push(rotatedFile);
      } catch (error) {
        // File doesn't exist
      }
    }
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        
        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);
            
            // Apply filters
            if (filters.type && logEntry.type !== filters.type) continue;
            if (filters.userId && logEntry.userId !== filters.userId) continue;
            if (filters.startDate && new Date(logEntry.timestamp) < new Date(filters.startDate)) continue;
            if (filters.endDate && new Date(logEntry.timestamp) > new Date(filters.endDate)) continue;
            
            logs.push(logEntry);
          } catch (parseError) {
            // Skip invalid log lines
          }
        }
      } catch (fileError) {
        // Skip files that can't be read
      }
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return logs;
  } catch (error) {
    console.error('Error reading audit logs:', error);
    return [];
  }
};

module.exports = {
  auditAdminActions,
  auditFailedAuth,
  logAuthEvent,
  logDataEvent,
  logSystemEvent,
  logSecurityEvent,
  getAuditLogs,
};
