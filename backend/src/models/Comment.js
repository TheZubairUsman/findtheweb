const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 2000],
      },
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    authorEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    ipHash: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('published', 'pending', 'deleted'),
      defaultValue: 'published',
    },
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    hooks: {
      afterCreate: async (comment) => {
        if (comment.status === 'published') {
          await sequelize.models.Post.increment('commentCount', {
            by: 1,
            where: { id: comment.postId },
          });
        }
      },
      afterUpdate: async (comment) => {
        if (comment.changed('status')) {
          const post = await sequelize.models.Post.findByPk(comment.postId);
          if (post) {
            await post.updateCommentCount();
          }
        }
      },
      afterDestroy: async (comment) => {
        if (comment.status === 'published') {
          await sequelize.models.Post.decrement('commentCount', {
            by: 1,
            where: { id: comment.postId },
          });
        }
      },
    },
    scopes: {
      published: {
        where: { status: 'published' },
      },
      pending: {
        where: { status: 'pending' },
      },
      byPost: (postId) => ({
        where: { postId, status: 'published' },
        order: [['created_at', 'ASC']],
      }),
    },
  });

  // Associations
  Comment.associate = function(models) {
    Comment.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
    });
  };

  // Class methods
  Comment.generateIpHash = function(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex');
  };

  Comment.checkRateLimit = async function(ipHash, timeWindow = 60000, maxComments = 5) {
    const since = new Date(Date.now() - timeWindow);
    const recentComments = await Comment.count({
      where: {
        ipHash,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: since,
        },
      },
    });
    
    return recentComments < maxComments;
  };

  // Instance methods
  Comment.prototype.moderate = async function(status) {
    return this.update({ status });
  };

  // Virtual fields
  Object.defineProperty(Comment.prototype, 'isPublished', {
    get: function() {
      return this.status === 'published';
    },
  });

  Object.defineProperty(Comment.prototype, 'isPending', {
    get: function() {
      return this.status === 'pending';
    },
  });

  return Comment;
};
