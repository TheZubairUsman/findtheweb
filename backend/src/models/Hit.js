const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const Hit = sequelize.define('Hit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    websiteId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ipHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
    },
    referrer: {
      type: DataTypes.STRING,
    },
  }, {
    modelName: 'Hit',
    tableName: 'hits',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['website_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['ip_hash'],
      },
      {
        fields: ['website_id', 'created_at'],
      },
    ],
    hooks: {
      afterCreate: async (hit) => {
        await sequelize.models.Website.increment(['totalHits', 'weeklyHits'], {
          by: 1,
          where: { id: hit.websiteId },
        });
      },
    },
  });

  // Class methods
  Hit.generateIpHash = function(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex');
  };

  Hit.checkRateLimit = async function(ipHash, websiteId, timeWindow = 60000) {
    const since = new Date(Date.now() - timeWindow);
    const recentHits = await Hit.count({
      where: {
        ipHash,
        websiteId,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: since,
        },
      },
    });
    
    return recentHits === 0;
  };

  Hit.getWeeklyHits = async function(websiteId) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return Hit.count({
      where: {
        websiteId,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: weekAgo,
        },
      },
    });
  };

  Hit.getMonthlyHits = async function(websiteId) {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return Hit.count({
      where: {
        websiteId,
        createdAt: {
          [sequelize.Sequelize.Op.gte]: monthAgo,
        },
      },
    });
  };

  Hit.generateWeeklyReport = async function() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const results = await Hit.findAll({
      attributes: [
        'websiteId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'hitCount'],
      ],
      where: {
        createdAt: {
          [sequelize.Sequelize.Op.gte]: weekAgo,
        },
      },
      group: ['websiteId'],
      order: [[sequelize.literal('hitCount'), 'DESC']],
      include: [
        {
          model: sequelize.models.Website,
          as: 'website',
          attributes: ['id', 'name', 'url'],
        },
      ],
    });

    return results;
  };

  Hit.cleanupOldHits = async function(daysToKeep = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const deletedCount = await Hit.destroy({
      where: {
        createdAt: {
          [sequelize.Sequelize.Op.lt]: cutoffDate,
        },
      },
    });

    return deletedCount;
  };

  Hit.updateWeeklyHitCounts = async function() {
    const websites = await sequelize.models.Website.findAll();
    
    for (const website of websites) {
      const weeklyHits = await Hit.getWeeklyHits(website.id);
      await website.update({ weeklyHits });
    }
  };

  // Associations
  Hit.associate = function(models) {
    Hit.belongsTo(models.Website, { foreignKey: 'websiteId', as: 'website' });
  };

  return Hit;
};
