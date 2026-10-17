'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
      },
      excerpt: {
        type: Sequelize.TEXT,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
      },
      url: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      votes_up: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      votes_down: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      comment_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      category: {
        type: Sequelize.STRING,
      },
      published_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('posts', ['slug'], { unique: true });
    await queryInterface.addIndex('posts', ['status']);
    await queryInterface.addIndex('posts', ['featured']);
    await queryInterface.addIndex('posts', ['published_at']);
    await queryInterface.addIndex('posts', ['votes_up']);
    await queryInterface.addIndex('posts', ['category']);
    await queryInterface.addIndex('posts', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  },
};
