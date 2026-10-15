require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  env,
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Security
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '90d',
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: process.env.RATE_LIMIT_MAX || 100,
  
  // Email
  emailFrom: process.env.EMAIL_FROM || 'noreply@findtheweb.com',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  
  // File uploads
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'],
};

const environmentConfigs = {
  development: {
    logLevel: 'debug',
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'findtheweb_dev',
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      dialect: 'postgres',
      logging: true,
    },
  },
  production: {
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      dialect: 'postgres',
      logging: false,
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    },
  },
  test: {
    logLevel: 'error',
    database: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 5432,
      name: process.env.TEST_DB_NAME || 'findtheweb_test',
      user: process.env.TEST_DB_USER || 'test',
      password: process.env.TEST_DB_PASS || 'test',
      dialect: 'postgres',
      logging: false,
    },
  },
};

const environmentConfig = environmentConfigs[env] || environmentConfigs.development;

// Merge base config with environment-specific config
const config = {
  ...baseConfig,
  ...environmentConfig,
};

// Validate required configuration
const requiredEnvVars = [
  'jwtSecret',
  // Add other required environment variables here
];

const missingVars = requiredEnvVars.filter(varName => !config[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

module.exports = config;
