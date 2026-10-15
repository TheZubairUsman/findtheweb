'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { Settings } = require('../models');
    
    // Default application settings
    const defaultSettings = [
      // General Settings
      {
        key: 'siteName',
        value: 'FindTheWeb',
        description: 'The name of the website',
        category: 'general',
        dataType: 'string',
        isPublic: true,
        isRequired: true,
        validation: {
          minLength: 1,
          maxLength: 100,
        },
      },
      {
        key: 'siteDescription',
        value: 'Discover amazing websites and tools from around the internet',
        description: 'The description of the website',
        category: 'general',
        dataType: 'string',
        isPublic: true,
        isRequired: true,
        validation: {
          minLength: 10,
          maxLength: 500,
        },
      },
      {
        key: 'adminEmail',
        value: 'admin@findtheweb.com',
        description: 'Administrator email address',
        category: 'general',
        dataType: 'string',
        isPublic: false,
        isRequired: true,
        validation: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
      },
      {
        key: 'siteUrl',
        value: 'https://findtheweb.com',
        description: 'The main URL of the website',
        category: 'general',
        dataType: 'string',
        isPublic: true,
        isRequired: true,
        validation: {
          pattern: '^https?://.+',
        },
      },
      
      // System Settings
      {
        key: 'maintenanceMode',
        value: false,
        description: 'Enable maintenance mode to show maintenance page to visitors',
        category: 'system',
        dataType: 'boolean',
        isPublic: true,
        isRequired: false,
      },
      {
        key: 'allowRegistration',
        value: true,
        description: 'Allow new users to register accounts',
        category: 'system',
        dataType: 'boolean',
        isPublic: true,
        isRequired: false,
      },
      {
        key: 'autoApproveWebsites',
        value: false,
        description: 'Automatically approve submitted websites without manual review',
        category: 'system',
        dataType: 'boolean',
        isPublic: false,
        isRequired: false,
      },
      {
        key: 'maxWebsitesPerUser',
        value: 10,
        description: 'Maximum number of websites a user can submit',
        category: 'system',
        dataType: 'number',
        isPublic: false,
        isRequired: false,
        validation: {
          min: 1,
          max: 100,
        },
      },
      
      // Email Settings
      {
        key: 'emailNotifications',
        value: true,
        description: 'Enable email notifications for admin actions',
        category: 'email',
        dataType: 'boolean',
        isPublic: false,
        isRequired: false,
      },
      {
        key: 'emailFrom',
        value: 'noreply@findtheweb.com',
        description: 'Default sender email address',
        category: 'email',
        dataType: 'string',
        isPublic: false,
        isRequired: true,
        validation: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
      },
      {
        key: 'emailReplyTo',
        value: 'support@findtheweb.com',
        description: 'Reply-to email address for outgoing emails',
        category: 'email',
        dataType: 'string',
        isPublic: false,
        isRequired: false,
        validation: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
      },
      
      // Performance Settings
      {
        key: 'cacheTimeout',
        value: 3600,
        description: 'Cache timeout in seconds',
        category: 'performance',
        dataType: 'number',
        isPublic: false,
        isRequired: false,
        validation: {
          min: 60,
          max: 86400,
        },
      },
      {
        key: 'maxFileSize',
        value: 5242880,
        description: 'Maximum file upload size in bytes (5MB)',
        category: 'performance',
        dataType: 'number',
        isPublic: false,
        isRequired: false,
        validation: {
          min: 1048576,
          max: 52428800,
        },
      },
      {
        key: 'allowedFileTypes',
        value: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        description: 'Allowed file types for uploads',
        category: 'performance',
        dataType: 'array',
        isPublic: false,
        isRequired: false,
      },
      
      // SEO Settings
      {
        key: 'defaultSeoTitle',
        value: 'FindTheWeb - Discover Amazing Websites',
        description: 'Default SEO title for the website',
        category: 'seo',
        dataType: 'string',
        isPublic: true,
        isRequired: false,
        validation: {
          minLength: 10,
          maxLength: 60,
        },
      },
      {
        key: 'defaultSeoDescription',
        value: 'FindTheWeb is a curated directory of amazing websites and tools from around the internet. Discover new resources, tools, and websites.',
        description: 'Default SEO description for the website',
        category: 'seo',
        dataType: 'string',
        isPublic: true,
        isRequired: false,
        validation: {
          minLength: 50,
          maxLength: 160,
        },
      },
      {
        key: 'defaultSeoKeywords',
        value: 'websites, tools, directory, discovery, internet, resources',
        description: 'Default SEO keywords for the website',
        category: 'seo',
        dataType: 'string',
        isPublic: true,
        isRequired: false,
      },
      
      // Social Media Settings
      {
        key: 'twitterHandle',
        value: '@findtheweb',
        description: 'Twitter handle for social media integration',
        category: 'social',
        dataType: 'string',
        isPublic: true,
        isRequired: false,
      },
      {
        key: 'facebookPage',
        value: 'https://facebook.com/findtheweb',
        description: 'Facebook page URL',
        category: 'social',
        dataType: 'string',
        isPublic: true,
        isRequired: false,
      },
      {
        key: 'linkedinPage',
        value: 'https://linkedin.com/company/findtheweb',
        description: 'LinkedIn page URL',
        category: 'social',
        dataType: 'string',
        isPublic: true,
        isRequired: false,
      },
      
      // Analytics Settings
      {
        key: 'googleAnalyticsId',
        value: '',
        description: 'Google Analytics tracking ID',
        category: 'analytics',
        dataType: 'string',
        isPublic: false,
        isRequired: false,
      },
      {
        key: 'googleTagManagerId',
        value: '',
        description: 'Google Tag Manager ID',
        category: 'analytics',
        dataType: 'string',
        isPublic: false,
        isRequired: false,
      },
      {
        key: 'enableAnalytics',
        value: true,
        description: 'Enable analytics tracking',
        category: 'analytics',
        dataType: 'boolean',
        isPublic: false,
        isRequired: false,
      },
      
      // Security Settings
      {
        key: 'enableRateLimiting',
        value: true,
        description: 'Enable rate limiting for API endpoints',
        category: 'security',
        dataType: 'boolean',
        isPublic: false,
        isRequired: false,
      },
      {
        key: 'maxLoginAttempts',
        value: 5,
        description: 'Maximum login attempts before account lockout',
        category: 'security',
        dataType: 'number',
        isPublic: false,
        isRequired: false,
        validation: {
          min: 3,
          max: 10,
        },
      },
      {
        key: 'sessionTimeout',
        value: 3600,
        description: 'Session timeout in seconds (1 hour)',
        category: 'security',
        dataType: 'number',
        isPublic: false,
        isRequired: false,
        validation: {
          min: 300,
          max: 86400,
        },
      },
    ];

    // Insert default settings
    for (const setting of defaultSettings) {
      try {
        await Settings.set(
          setting.key,
          setting.value,
          {
            description: setting.description,
            category: setting.category,
            isPublic: setting.isPublic,
            isRequired: setting.isRequired,
            validation: setting.validation,
          }
        );
        console.log(`✓ Created setting: ${setting.key}`);
      } catch (error) {
        console.error(`✗ Failed to create setting ${setting.key}:`, error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const { Settings } = require('../models');
    
    // Delete all settings
    await Settings.destroy({
      where: {},
      truncate: true,
    });
    
    console.log('✓ Removed all settings');
  }
};
