'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create subscription_plans table
    await queryInterface.createTable('subscription_plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      billing_cycle: {
        type: Sequelize.ENUM('monthly', 'quarterly', 'yearly'),
        defaultValue: 'monthly'
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      max_listings: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      max_images: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      has_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_urgent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_highlight: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_video: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_social_links: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_contact_form: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_map: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_website_link: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_phone_number: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_email: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_address: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_business_hours: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_gallery: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_reviews: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_social_sharing: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_seo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_analytics: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_custom_domain: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      has_priority_support: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_popular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add subscription fields to business_listings table
    await queryInterface.addColumn('business_listings', 'subscription_plan_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('business_listings', 'subscription_status', {
      type: Sequelize.ENUM('active', 'pending', 'expired', 'canceled'),
      defaultValue: 'pending'
    });

    await queryInterface.addColumn('business_listings', 'subscription_start_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('business_listings', 'subscription_end_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('business_listings', 'subscription_renewal_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('business_listings', 'subscription_canceled_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove subscription fields from business_listings
    await queryInterface.removeColumn('business_listings', 'subscription_plan_id');
    await queryInterface.removeColumn('business_listings', 'subscription_status');
    await queryInterface.removeColumn('business_listings', 'subscription_start_date');
    await queryInterface.removeColumn('business_listings', 'subscription_end_date');
    await queryInterface.removeColumn('business_listings', 'subscription_renewal_date');
    await queryInterface.removeColumn('business_listings', 'subscription_canceled_at');
    
    // Remove enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_business_listings_subscription_status";');
    
    // Drop subscription_plans table
    await queryInterface.dropTable('subscription_plans');
  }
};
