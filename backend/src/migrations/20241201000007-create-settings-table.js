'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [1, 255],
          notEmpty: true,
        },
      },
      value: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'general',
        validate: {
          len: [1, 100],
        },
      },
      dataType: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'object', 'array'),
        allowNull: false,
        defaultValue: 'string',
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      validation: {
        type: Sequelize.JSON,
        allowNull: true,
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
    await queryInterface.addIndex('Settings', ['key']);
    await queryInterface.addIndex('Settings', ['category']);
    await queryInterface.addIndex('Settings', ['isPublic']);
    await queryInterface.addIndex('Settings', ['isRequired']);
    await queryInterface.addIndex('Settings', ['dataType']);
    
    // Add composite indexes
    await queryInterface.addIndex('Settings', ['category', 'isPublic']);
    await queryInterface.addIndex('Settings', ['isPublic', 'isRequired']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Settings');
  }
};
