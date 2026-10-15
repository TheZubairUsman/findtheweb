'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('votes', {
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
      type: {
        type: Sequelize.ENUM('like', 'dislike'),
        allowNull: false,
      },
      ip_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visitor_id: {
        type: Sequelize.UUID,
        allowNull: false,
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

    // Add unique constraints to prevent duplicate votes
    await queryInterface.addConstraint('votes', {
      fields: ['post_id', 'ip_hash', 'type'],
      type: 'unique',
      name: 'unique_vote_per_ip_type',
    });

    await queryInterface.addConstraint('votes', {
      fields: ['post_id', 'visitor_id', 'type'],
      type: 'unique',
      name: 'unique_vote_per_visitor_type',
    });

    // Add indexes
    await queryInterface.addIndex('votes', ['post_id']);
    await queryInterface.addIndex('votes', ['type']);
    await queryInterface.addIndex('votes', ['ip_hash']);
    await queryInterface.addIndex('votes', ['visitor_id']);
    await queryInterface.addIndex('votes', ['post_id', 'type']);
    await queryInterface.addIndex('votes', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('votes');
  },
};
