const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const { NODE_ENV, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, EMAIL_TEMPLATES_DIR } = process.env;
const logger = require('../utils/logger');

// Configure email transport
let transporter;

if (NODE_ENV === 'production') {
  // Production: Use SMTP
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT || 587,
    secure: SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  // Development: Use JSON transport (no external SMTP connection).
  // This avoids Invalid login / SMTP failures during local dev.
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

// Verify connection configuration
if (NODE_ENV === 'production') {
  transporter.verify(function (error) {
    if (error) {
      logger.error('SMTP connection error:', error);
    } else {
      logger.info('SMTP server is ready to take our messages');
    }
  });
} else {
  logger.info('Email: using development jsonTransport (no external SMTP).');
}

// Compile and cache templates
const templates = {};

/**
 * Load and compile an email template
 * @param {string} templateName - Name of the template file (without .hbs extension)
 * @returns {HandlebarsTemplateDelegate} Compiled template function
 */
function getTemplate(templateName) {
  if (templates[templateName]) {
    return templates[templateName];
  }

  const templatePath = path.join(
    EMAIL_TEMPLATES_DIR || path.join(__dirname, '../../email-templates'),
    `${templateName}.hbs`
  );

  try {
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    templates[templateName] = handlebars.compile(templateSource);
    return templates[templateName];
  } catch (error) {
    logger.error(`Failed to load email template: ${templateName}`, error);
    throw new Error(`Email template '${templateName}' not found`);
  }
}

/**
 * Send an email using a template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Name of the template file (without .hbs extension)
 * @param {Object} options.context - Data to pass to the template
 * @param {string} [options.from] - Sender email address
 * @param {Array} [options.attachments] - Email attachments
 * @returns {Promise<Object>} Result of the send operation
 */
async function sendEmail({
  to,
  subject,
  template,
  context = {},
  from = SMTP_FROM || 'no-reply@findtheweb.app',
  attachments = [],
}) {
  try {
    // Add common variables to template context
    const templateContext = {
      ...context,
      year: new Date().getFullYear(),
      appName: 'FindTheWeb',
      appUrl: process.env.CLIENT_URL || 'https://findtheweb.app',
    };

    // Compile template
    const templateFn = getTemplate(template);
    const html = templateFn(templateContext);

    // Setup email data
    const mailOptions = {
      from: `"FindTheWeb" <${from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      attachments,
    };

    // In development, log the email payload instead of sending via SMTP
    if (NODE_ENV !== 'production') {
      logger.info('DEV email (not sent):', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        length: mailOptions.html?.length || 0,
      });
      // Send through jsonTransport so it resolves successfully without external SMTP
      const info = await transporter.sendMail(mailOptions);
      return {
        messageId: info.messageId || 'dev-json-transport',
        envelope: info.envelope || { from: mailOptions.from, to: mailOptions.to },
        preview: info.message || '(jsonTransport payload)',
      };
    }

    // Send the email in production
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send a verification email to a new user
 * @param {Object} user - User object
 * @param {string} verificationUrl - URL for email verification
 * @returns {Promise<Object>} Result of the send operation
 */
async function sendVerificationEmail(user, verificationUrl) {
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    template: 'verify-email',
    context: {
      name: user.name || user.firstName || 'FindTheWeb member',
      verificationUrl,
    },
  });
}

/**
 * Send a password reset email
 * @param {Object} user - User object
 * @param {string} resetUrl - URL for password reset
 * @returns {Promise<Object>} Result of the send operation
 */
async function sendPasswordResetEmail(user, resetUrl) {
  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    template: 'reset-password',
    context: {
      name: user.name || user.firstName || 'FindTheWeb member',
      resetUrl,
      expiresIn: '1 hour',
    },
  });
}

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object
 * @returns {Promise<Object>} Result of the send operation
 */
async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to FindTheWeb!',
    template: 'welcome',
    context: {
      name: user.name || user.firstName || 'FindTheWeb member',
      loginUrl: `${process.env.CLIENT_URL}/login`,
    },
  });
}

/**
 * Send an email notification for a new listing submission
 * @param {Object} user - User object
 * @param {Object} listing - Listing object
 * @returns {Promise<Object>} Result of the send operation
 */
async function sendListingSubmissionEmail(user, listing) {
  return sendEmail({
    to: user.email,
    subject: `Your listing "${listing.name}" has been submitted for review`,
    template: 'listing-submitted',
    context: {
      name: user.firstName,
      listingName: listing.name,
      listingUrl: `${process.env.CLIENT_URL}/listings/${listing.slug}`,
    },
  });
}

/**
 * Send an email notification when a listing is approved
 * @param {Object} user - User object
 * @param {Object} listing - Listing object
 * @returns {Promise<Object>} Result of the send operation
 */
async function sendListingApprovalEmail(user, listing) {
  return sendEmail({
    to: user.email,
    subject: `Your listing "${listing.name}" has been approved!`,
    template: 'listing-approved',
    context: {
      name: user.firstName,
      listingName: listing.name,
      listingUrl: `${process.env.CLIENT_URL}/listings/${listing.slug}`,
    },
  });
}

/**
 * Send an email notification when a listing is rejected
 * @param {Object} user - User object
 * @param {Object} listing - Listing object
 * @param {string} reason - Reason for rejection
 * @returns {Promise<Object>} Result of the send operation
 */
async function sendListingRejectionEmail(user, listing, reason) {
  return sendEmail({
    to: user.email,
    subject: `Update on your listing "${listing.name}"`,
    template: 'listing-rejected',
    context: {
      name: user.firstName,
      listingName: listing.name,
      reason,
      editUrl: `${process.env.CLIENT_URL}/dashboard/listings/${listing.id}/edit`,
    },
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendListingSubmissionEmail,
  sendListingApprovalEmail,
  sendListingRejectionEmail,
};
