'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [1, 255],
        },
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 255],
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
        },
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [1, 100],
        },
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'draft', 'archived'),
        defaultValue: 'draft',
        allowNull: false,
      },
      features: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 100],
        },
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      weight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      seoTitle: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [1, 255],
        },
      },
      seoDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      seoKeywords: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      featuredOrder: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      purchaseCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Products', ['category']);
    await queryInterface.addIndex('Products', ['status']);
    await queryInterface.addIndex('Products', ['featured']);
    await queryInterface.addIndex('Products', ['price']);
    await queryInterface.addIndex('Products', ['createdAt']);
    await queryInterface.addIndex('Products', ['name']);
    await queryInterface.addIndex('Products', ['sku']);
    await queryInterface.addIndex('Products', ['slug']);
    
    // Add composite indexes
    await queryInterface.addIndex('Products', ['status', 'featured']);
    await queryInterface.addIndex('Products', ['category', 'status']);
    await queryInterface.addIndex('Products', ['featured', 'featuredOrder']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Products');
  }
};
