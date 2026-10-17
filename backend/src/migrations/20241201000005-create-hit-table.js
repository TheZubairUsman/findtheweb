'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hits', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      website_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'websites',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ip_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.TEXT,
      },
      referrer: {
        type: Sequelize.STRING,
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

    // Add indexes for efficient querying
    await queryInterface.addIndex('hits', ['website_id']);
    await queryInterface.addIndex('hits', ['created_at']);
    await queryInterface.addIndex('hits', ['ip_hash']);
    await queryInterface.addIndex('hits', ['website_id', 'created_at']);
    await queryInterface.addIndex('hits', ['website_id', 'ip_hash']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hits');
  },
};
