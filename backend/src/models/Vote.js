const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('Vote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false,
    },
    ipHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visitorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Vote',
    tableName: 'votes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['post_id', 'ip_hash', 'type'],
        name: 'unique_vote_per_ip_type',
      },
      {
        unique: true,
        fields: ['post_id', 'visitor_id', 'type'],
        name: 'unique_vote_per_visitor_type',
      },
    ],
    hooks: {
      afterCreate: async (vote) => {
        const post = await sequelize.models.Post.findByPk(vote.postId);
        if (post) {
          await post.updateVoteCount();
        }
      },
      afterDestroy: async (vote) => {
        const post = await sequelize.models.Post.findByPk(vote.postId);
        if (post) {
          await post.updateVoteCount();
        }
      },
    },
    scopes: {
      likes: {
        where: { type: 'like' },
      },
      dislikes: {
        where: { type: 'dislike' },
      },
      byPost: (postId) => ({
        where: { postId },
      }),
      byIp: (ipHash) => ({
        where: { ipHash },
      }),
    },
  });

  // Class methods
  Vote.generateIpHash = function(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex');
  };

  Vote.generateVisitorId = function() {
    return crypto.randomUUID();
  };

  Vote.hasVoted = async function(postId, ipHash, visitorId, type = null) {
    const where = { postId, ipHash, visitorId };
    if (type) {
      where.type = type;
    }
    
    const vote = await this.findOne({ where });
    return vote;
  };

  Vote.checkRateLimit = async function(ipHash, timeWindow = 60000, maxVotes = 10) {
    const since = new Date(Date.now() - timeWindow);
    const recentVotes = await this.count({
      where: {
        ipHash,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: since,
        },
      },
    });
    
    return recentVotes < maxVotes;
  };

  Vote.toggleVote = async function(postId, ipHash, visitorId, type) {
    const existingVote = await this.hasVoted(postId, ipHash, visitorId, type);
    
    if (existingVote) {
      await existingVote.destroy();
      return { action: 'removed', vote: null };
    } else {
      // Remove opposite vote if exists
      const oppositeType = type === 'like' ? 'dislike' : 'like';
      const oppositeVote = await this.hasVoted(postId, ipHash, visitorId, oppositeType);
      if (oppositeVote) {
        await oppositeVote.destroy();
      }
      
      const newVote = await this.create({
        postId,
        ipHash,
        visitorId,
        type,
      });
      
      return { action: 'created', vote: newVote };
    }
  };

  // Associations
  Vote.associate = function(models) {
    Vote.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
  };

  return Vote;
};
