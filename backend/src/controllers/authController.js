const User = require('../models/User');
const TwoFactorAuthService = require('../services/twoFactorService');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * @desc    Setup 2FA for a user
 * @route   POST /api/v1/auth/2fa/setup
 * @access  Private
 */
const setup2FA = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.twoFAEnabled) {
      return next(new ErrorResponse('2FA is already enabled', 400));
    }

    const { secret, otpauthUrl, recoveryCodes } = await user.setup2FA();
    
    // Generate QR code for the authenticator app
    const qrCode = await TwoFactorAuthService.generateQRCode(otpauthUrl);

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCode,
        recoveryCodes, // Show these to the user ONCE and store them securely
      },
    });
  } catch (error) {
    logger.error(`Setup 2FA error: ${error.message}`);
    next(new ErrorResponse('Failed to setup 2FA', 500));
  }
};

/**
 * @desc    Verify 2FA setup
 * @route   POST /api/v1/auth/2fa/verify
 * @access  Private
 */
const verify2FASetup = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new ErrorResponse('Please provide a verification token', 400));
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.twoFASecret) {
      return next(new ErrorResponse('2FA is not set up for this user', 400));
    }

    const isTokenValid = user.verify2FAToken(token);
    
    if (!isTokenValid) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Enable 2FA for the user
    user.twoFAEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA has been enabled successfully',
    });
  } catch (error) {
    logger.error(`Verify 2FA setup error: ${error.message}`);
    next(new ErrorResponse('Failed to verify 2FA setup', 500));
  }
};

/**
 * @desc    Disable 2FA for a user
 * @route   DELETE /api/v1/auth/2fa/disable
 * @access  Private
 */
const disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.twoFAEnabled) {
      return next(new ErrorResponse('2FA is not enabled for this user', 400));
    }

    // Verify the token before disabling 2FA
    const isTokenValid = user.verify2FAToken(token);
    
    if (!isTokenValid) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    await user.disable2FA();

    res.status(200).json({
      success: true,
      message: '2FA has been disabled successfully',
    });
  } catch (error) {
    logger.error(`Disable 2FA error: ${error.message}`);
    next(new ErrorResponse('Failed to disable 2FA', 500));
  }
};

/**
 * @desc    Generate new recovery codes
 * @route   POST /api/v1/auth/2fa/recovery-codes
 * @access  Private
 */
const generateRecoveryCodes = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.twoFAEnabled) {
      return next(new ErrorResponse('2FA is not enabled for this user', 400));
    }

    const recoveryCodes = TwoFactorAuthService.generateRecoveryCodes();
    user.twoFARecoveryCodes = recoveryCodes;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        recoveryCodes, // Show these to the user ONCE and store them securely
      },
    });
  } catch (error) {
    logger.error(`Generate recovery codes error: ${error.message}`);
    next(new ErrorResponse('Failed to generate recovery codes', 500));
  }
};

/**
 * @desc    Verify 2FA token during login
 * @route   POST /api/v1/auth/2fa/verify-login
 * @access  Public
 */
const verify2FALogin = async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return next(new ErrorResponse('Please provide email and token', 400));
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if (!user.twoFAEnabled) {
      return next(new ErrorResponse('2FA is not enabled for this user', 400));
    }

    const isTokenValid = user.verify2FAToken(token);
    
    if (!isTokenValid) {
      return next(new ErrorResponse('Invalid token', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFAEnabled: user.twoFAEnabled,
      },
    });
  } catch (error) {
    logger.error(`Verify 2FA login error: ${error.message}`);
    next(new ErrorResponse('Failed to verify 2FA token', 500));
  }
};

module.exports = {
  setup2FA,
  verify2FASetup,
  disable2FA,
  generateRecoveryCodes,
  verify2FALogin,
};
