'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('websites', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tier: {
        type: Sequelize.ENUM('featured', 'premium', 'enterprise', 'standard'),
        defaultValue: 'standard',
      },
      weekly_hits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_hits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      region: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'pending', 'suspended'),
        defaultValue: 'active',
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      seo_title: {
        type: Sequelize.STRING,
      },
      seo_description: {
        type: Sequelize.TEXT,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('websites', ['category_id']);
    await queryInterface.addIndex('websites', ['tier']);
    await queryInterface.addIndex('websites', ['status']);
    await queryInterface.addIndex('websites', ['featured']);
    await queryInterface.addIndex('websites', ['weekly_hits']);
    await queryInterface.addIndex('websites', ['total_hits']);
    await queryInterface.addIndex('websites', ['slug'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('websites');
  },
};
