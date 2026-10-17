'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      author_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      author_email: {
        type: Sequelize.STRING,
      },
      ip_hash: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM('published', 'pending', 'deleted'),
        defaultValue: 'published',
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
    await queryInterface.addIndex('comments', ['post_id']);
    await queryInterface.addIndex('comments', ['status']);
    await queryInterface.addIndex('comments', ['created_at']);
    await queryInterface.addIndex('comments', ['ip_hash']);
    await queryInterface.addIndex('comments', ['post_id', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  },
};
