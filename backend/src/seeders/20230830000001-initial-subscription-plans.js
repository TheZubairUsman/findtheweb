'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const plans = [
      {
        id: uuidv4(),
        name: 'Basic',
        slug: 'basic',
        description: 'Perfect for individuals and small businesses just getting started',
        price: 9.99,
        billing_cycle: 'monthly',
        max_listings: 1,
        max_images: 5,
        has_website_link: true,
        has_phone_number: true,
        has_email: true,
        has_address: true,
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Professional',
        slug: 'professional',
        description: 'Ideal for growing businesses with multiple listings',
        price: 24.99,
        billing_cycle: 'monthly',
        max_listings: 5,
        max_images: 20,
        has_website_link: true,
        has_phone_number: true,
        has_email: true,
        has_address: true,
        has_map: true,
        has_business_hours: true,
        has_gallery: true,
        has_reviews: true,
        has_social_sharing: true,
        is_popular: true,
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Business',
        slug: 'business',
        description: 'For established businesses that need premium features',
        price: 49.99,
        billing_cycle: 'monthly',
        max_listings: 20,
        max_images: 100,
        has_website_link: true,
        has_phone_number: true,
        has_email: true,
        has_address: true,
        has_map: true,
        has_business_hours: true,
        has_gallery: true,
        has_reviews: true,
        has_social_sharing: true,
        has_seo: true,
        has_analytics: true,
        has_priority_support: true,
        order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Agency',
        slug: 'agency',
        description: 'For agencies managing multiple business listings',
        price: 99.99,
        billing_cycle: 'monthly',
        max_listings: 100,
        max_images: 500,
        has_website_link: true,
        has_phone_number: true,
        has_email: true,
        has_address: true,
        has_map: true,
        has_business_hours: true,
        has_gallery: true,
        has_reviews: true,
        has_social_sharing: true,
        has_seo: true,
        has_analytics: true,
        has_custom_domain: true,
        has_priority_support: true,
        order: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('subscription_plans', plans, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('subscription_plans', null, {});
  }
};
