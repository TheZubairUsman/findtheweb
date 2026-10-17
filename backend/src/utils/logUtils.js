/**
 * Logging utility functions for consistent formatting
 */

// ANSI color codes
const colors = {
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  // Styles
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m'
};

/**
 * Get color and style for HTTP status codes
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Object containing color and style properties
 */
const getStatusStyle = (statusCode) => {
  if (statusCode >= 500) {
    return {
      color: colors.brightRed,
      style: colors.bright,
      emoji: '🔴',
      label: 'Server Error'
    };
  }
  
  if (statusCode >= 400) {
    return {
      color: colors.brightYellow,
      style: colors.underscore,
      emoji: '🟡',
      label: 'Client Error'
    };
  }
  
  if (statusCode >= 300) {
    return {
      color: colors.brightCyan,
      style: '',
      emoji: '🔵',
      label: 'Redirect'
    };
  }
  
  if (statusCode >= 200) {
    return {
      color: colors.brightGreen,
      style: '',
      emoji: '🟢',
      label: 'Success'
    };
  }
  
  return {
    color: colors.brightBlue,
    style: '',
    emoji: '⚪',
    label: 'Info'
  };
};

/**
 * Format HTTP status code with color and emoji
 * @param {number|string} status - HTTP status code
 * @returns {string} Formatted status string
 */
const formatStatus = (status) => {
  const statusCode = parseInt(status, 10);
  if (isNaN(statusCode)) return status;
  
  const { color, style, emoji, label } = getStatusStyle(statusCode);
  const statusText = `${statusCode} ${label}`;
  
  return `${emoji} ${style}${color}${statusText}${colors.reset}`;
};

/**
 * Format a log message with colors
 * @param {string} message - The message to format
 * @param {string} level - Log level (info, warn, error, etc.)
 * @returns {string} Formatted message
 */
const formatMessage = (message, level = 'info') => {
  const levelColors = {
    error: colors.brightRed,
    warn: colors.brightYellow,
    info: colors.brightCyan,
    debug: colors.brightMagenta,
    http: colors.brightBlue
  };
  
  const color = levelColors[level.toLowerCase()] || colors.reset;
  return `${color}${message}${colors.reset}`;
};

module.exports = {
  colors,
  getStatusStyle,
  formatStatus,
  formatMessage
};
