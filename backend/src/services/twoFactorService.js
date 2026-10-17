const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { authenticator } = require('otplib');
const config = require('../config/config');
const logger = require('../utils/logger');

class TwoFactorAuthService {
  /**
   * Generate a new 2FA secret for a user
   * @returns {Object} Secret and OTP authentication URL
   */
  static generate2FASecret(email) {
    try {
      const secret = speakeasy.generateSecret({
        name: `FindTheWeb:${email}`,
        issuer: 'FindTheWeb',
        length: 20,
      });

      return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
      };
    } catch (error) {
      logger.error('Error generating 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  /**
   * Generate QR code for 2FA setup
   * @param {string} otpauthUrl - OTP authentication URL
   * @returns {Promise<string>} Data URL of the QR code
   */
  static async generateQRCode(otpauthUrl) {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      logger.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify 2FA token
   * @param {string} token - The 2FA token to verify
   * @param {string} secret - The user's 2FA secret
   * @returns {boolean} Whether the token is valid
   */
  static verifyToken(token, secret) {
    try {
      // For testing purposes, accept any token in development
      if (config.env === 'development' && token === '123456') {
        return true;
      }

      return authenticator.verify({
        token,
        secret,
        window: 1, // Allow 1 step (30s) before/after current time
      });
    } catch (error) {
      logger.error('Error verifying 2FA token:', error);
      return false;
    }
  }

  /**
   * Generate recovery codes for 2FA
   * @param {number} count - Number of recovery codes to generate (default: 8)
   * @returns {string[]} Array of recovery codes
   */
  static generateRecoveryCodes(count = 8) {
    const codes = [];
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const codeLength = 10;

    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < codeLength; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Add hyphens for better readability: A1B2-C3D4-E5F6
      const formattedCode = code.match(/.{1,2}/g).join('-');
      codes.push(formattedCode);
    }

    return codes;
  }
}

module.exports = TwoFactorAuthService;
