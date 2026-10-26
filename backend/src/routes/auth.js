const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { User, Admin } = require('../models');
const { authenticateJWT, authenticateAdmin } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, CLIENT_URL } = process.env;
const EFFECTIVE_JWT_SECRET = JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'findtheweb-test-only-secret' : undefined);
const JWT_ISSUER = process.env.JWT_ISSUER || 'findtheweb-admin';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'findtheweb-admin-ui';
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// Brute-force protection for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    EFFECTIVE_JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN || '7d', issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
  );
};

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
    body('firstName', 'First name is required').not().isEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { email, password, firstName, lastName } = req.body;
      const normalizedEmail = email.toLowerCase().trim();
      const displayName = `${firstName.trim()}${lastName ? ` ${lastName.trim()}` : ''}`.slice(0, 100);

      // Check if user already exists
      let user = await User.findOne({ where: { email: normalizedEmail } });
      if (user) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists' 
        });
      }

      // Create new user
      user = await User.create({
        email: normalizedEmail,
        password,
        name: displayName,
        role: 'user',
        isActive: true,
        emailVerified: true,
      });

      // Generate JWT token
      const token = generateToken(user);
      const userData = user.get({ plain: true });
      delete userData.password;
      delete userData.emailVerificationToken;
      delete userData.resetPasswordToken;

      res.status(201).json({
        success: true,
        token,
        user: userData,
      });
    } catch (err) {
      logger.error('Registration error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is not active' });
      }

      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user);
      const userData = user.get({ plain: true });
      delete userData.password;
      delete userData.emailVerificationToken;
      delete userData.resetPasswordToken;

      res.json({
        success: true,
        token,
        user: userData,
      });
    } catch (err) {
      logger.error('Login error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/2fa/verify
// @desc    Verify 2FA code
// @access  Public
router.post(
  '/2fa/verify',
  [
    body('code', 'Verification code is required').not().isEmpty(),
    body('tempToken', 'Temporary token is required').not().isEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { code, tempToken } = req.body;

      // Verify temp token
      let decoded;
      try {
        decoded = jwt.verify(tempToken, EFFECTIVE_JWT_SECRET, {
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
        });
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired verification code' 
        });
      }

      if (decoded.purpose !== '2fa') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code',
        });
      }

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user' 
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: code,
        window: 1,
      });

      if (!verified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user);
      const userData = user.get({ plain: true });
      delete userData.password;

      res.json({
        success: true,
        token,
        user: userData,
      });
    } catch (err) {
      logger.error('2FA verification error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/forgot-password
// @desc    Forgot password - send reset email
// @access  Public
router.post(
  '/forgot-password',
  [body('email', 'Please include a valid email').isEmail()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { email } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // For security, don't reveal if the email exists or not
        return res.json({ success: true, message: 'If your email exists in our system, you will receive a password reset link' });
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send reset email
      const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'reset-password',
        context: {
          name: user.firstName,
          resetUrl,
          expiresIn: '1 hour',
        },
      });

      res.json({ success: true, message: 'Password reset email sent' });
    } catch (err) {
      logger.error('Forgot password error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password',
  [
    body('token', 'Reset token is required').not().isEmpty(),
    body('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { token, password } = req.body;

      // Find user by reset token
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: Date.now() },
        },
      });

      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired reset token' 
        });
      }

      // Update password and clear reset token
      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      // Send confirmation email
      await sendEmail({
        to: user.email,
        subject: 'Password Changed Successfully',
        template: 'password-changed',
        context: {
          name: user.firstName,
        },
      });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      logger.error('Reset password error:', err);
      next(err);
    }
  }
);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateJWT, async (req, res) => {
  try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'twoFASecret'] },
      });
      res.json({ 
        success: true, 
        data: user 
      });
  } catch (err) {
    logger.error('Get current user error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/v1/auth/2fa/setup
// @desc    Setup 2FA for a user
// @access  Private
router.post(
  '/2fa/setup',
  authenticateJWT,
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user' 
        });
      }

      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        length: 16,
      });

      // Update user with 2FA secret
      user.twoFASecret = secret.base32;
      await user.save();

      // Return 2FA setup details
      res.json({
        success: true,
        secret: secret.ascii,
        qrCode: secret.otpauth_url,
      });
    } catch (err) {
      logger.error('2FA setup error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/2fa/verify
// @desc    Verify 2FA setup
// @access  Private
router.post(
  '/2fa/verify',
  [
    authenticateJWT,
    body('token', 'Verification token is required').not().isEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { token } = req.body;

      // Find user
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user' 
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      // Enable 2FA for user
      user.twoFAEnabled = true;
      await user.save();

      res.json({ success: true, message: '2FA setup verified successfully' });
    } catch (err) {
      logger.error('2FA verification error:', err);
      next(err);
    }
  }
);

// @route   DELETE /api/v1/auth/2fa/disable
// @desc    Disable 2FA for a user
// @access  Private
router.delete(
  '/2fa/disable',
  [
    authenticateJWT,
    body('token', 'Verification token is required').not().isEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { token } = req.body;

      // Find user
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user' 
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      // Disable 2FA for user
      user.twoFAEnabled = false;
      await user.save();

      res.json({ success: true, message: '2FA disabled successfully' });
    } catch (err) {
      logger.error('2FA disable error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/2fa/recovery-codes
// @desc    Generate new recovery codes
// @access  Private
router.post(
  '/2fa/recovery-codes',
  authenticateJWT,
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user' 
        });
      }

      // Generate new recovery codes
      const recoveryCodes = [];
      for (let i = 0; i < 5; i++) {
        recoveryCodes.push(crypto.randomBytes(16).toString('hex'));
      }

      // Update user with new recovery codes
      user.recoveryCodes = recoveryCodes;
      await user.save();

      res.json({ success: true, recoveryCodes });
    } catch (err) {
      logger.error('Recovery codes generation error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/2fa/verify-login
// @desc    Verify 2FA token during login
// @access  Public
router.post(
  '/2fa/verify-login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('token', 'Verification token is required').not().isEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          data: { errors: errors.array() } 
        });
      }

      const { email, token } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid user' 
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      // Generate JWT token
      const jwtToken = generateToken(user);
      const userData = user.get({ plain: true });
      delete userData.password;

      res.json({
        success: true,
        token: jwtToken,
        user: userData,
      });
    } catch (err) {
      logger.error('2FA login verification error:', err);
      next(err);
    }
  }
);

// @route   POST /api/v1/auth/admin/login
// @desc    Authenticate admin & get token
// @access  Public
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  skip: () => process.env.NODE_ENV === 'test'
});

router.post('/admin/login', adminLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ 
      where: { 
        email: email.toLowerCase().trim(),
        isActive: true // Changed from status: 'active' to isActive: true
      } 
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' // Generic message for security
      });
    }

    // Check if account is locked
    if (admin.loginAttempts >= 5 && admin.lockUntil > new Date()) {
      return res.status(403).json({ 
        success: false,
        message: 'Account is temporarily locked. Please try again later or contact support.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      // Increment login attempts
      await admin.incrementLoginAttempts();
      
      const attemptsLeft = 5 - (admin.loginAttempts + 1);
      
      return res.status(401).json({ 
        success: false,
        message: `Invalid email or password. ${attemptsLeft > 0 ? attemptsLeft + ' attempts left.' : 'Account will be locked after too many attempts.'}`
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        role: 'admin'
      },
      EFFECTIVE_JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      }
    );

    // Return user data (excluding sensitive info)
    const userData = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      isAdmin: true,
      lastLogin: admin.lastLogin
    };

    // Update last login time
    await admin.update({ lastLogin: new Date() });

    res.json({ 
      success: true,
      token,
      // Keep the top-level admin field for the existing frontend contract.
      // `user` and `data.admin` remain for backwards compatibility.
      admin: userData,
      user: userData,
      data: { token, admin: userData }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
});

// @route   GET /api/v1/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.get('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });

    // Check if user still exists
    const admin = await Admin.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      raw: true
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: {
        ...admin,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    let message = 'Invalid or expired token';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please login again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }
    
    res.status(401).json({ 
      success: false, 
      message
    });
  }
});

// @route   GET /api/v1/auth/check-admin
// @desc    Check if user is admin
// @access  Private
router.get('/check-admin', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    
    // Check if admin exists and is active
    const admin = await Admin.findByPk(decoded.id);
    if (!admin || !admin.isActive || decoded.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin' 
      });
    }

    res.json({ 
      success: true, 
      data: { isAdmin: true } 
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// @route   POST /api/v1/auth/logout
// @desc    Logout (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @route   POST /api/v1/auth/admin/logout
// @desc    Logout an authenticated admin session
// @access  Private/Admin
router.post('/admin/logout', authenticateAdmin, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Helper function to generate 2FA token
function generate2FAToken(user) {
  return jwt.sign(
    { id: user.id, purpose: '2fa' },
    EFFECTIVE_JWT_SECRET,
    { expiresIn: '5m' } // Short expiration for security
  );
}

module.exports = router;
