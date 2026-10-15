'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Read websites data from JSON file
      const websitesPath = path.join(__dirname, '../../../src/data/websites.json');
      const websitesData = JSON.parse(fs.readFileSync(websitesPath, 'utf8'));

      // Get all categories to map categoryId to actual UUID
      const categories = await queryInterface.sequelize.query(
        'SELECT id, name FROM categories',
        { type: Sequelize.QueryTypes.SELECT }
      );

      const categoryMap = {};
      categories.forEach(cat => {
        // Create a mapping from category name variations to UUID
        const normalizedName = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        categoryMap[normalizedName] = cat.id;
      });

      // Define tier distribution for demo purposes
      const tiers = ['featured', 'premium', 'enterprise', 'standard'];
      const tierWeights = [0.1, 0.2, 0.15, 0.55]; // 10% featured, 20% premium, 15% enterprise, 55% standard

      const websites = websitesData.map((website, index) => {
        // Assign tier based on weighted distribution
        const random = Math.random();
        let tier = 'standard';
        let cumulative = 0;
        for (let i = 0; i < tiers.length; i++) {
          cumulative += tierWeights[i];
          if (random <= cumulative) {
            tier = tiers[i];
            break;
          }
        }

        // Map categoryId to actual category UUID
        const normalizedCategoryId = website.categoryId.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const categoryId = categoryMap[normalizedCategoryId];

        if (!categoryId) {
          console.warn(`Category not found for: ${website.categoryId}, skipping website: ${website.name}`);
          return null;
        }

        return {
          id: Sequelize.UUIDV4,
          name: website.name,
          slug: website.id, // Use existing ID as slug
          url: website.url,
          description: website.description,
          category_id: categoryId,
          tier: tier,
          weekly_hits: Math.floor(Math.random() * 1000), // Random initial hits for demo
          total_hits: Math.floor(Math.random() * 10000),
          region: website.regions ? website.regions[0] : 'global',
          status: 'active',
          featured: tier === 'featured' || Math.random() < 0.1,
          verified: tier !== 'standard' || Math.random() < 0.3,
          seo_title: `${website.name} - Find the Web`,
          seo_description: `${website.description} Discover ${website.name} and more hidden gems on Find the Web.`,
          metadata: {
            originalId: website.id,
            regions: website.regions || ['global'],
            categoryName: website.categoryName,
          },
          created_at: new Date(),
          updated_at: new Date(),
        };
      }).filter(Boolean); // Remove null entries

      if (websites.length === 0) {
        console.warn('No websites to insert');
        return;
      }

      // Bulk insert websites
      await queryInterface.bulkInsert('websites', websites);
      console.log(`Successfully migrated ${websites.length} websites`);

    } catch (error) {
      console.error('Error migrating websites data:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('websites', null, {});
  },
};
