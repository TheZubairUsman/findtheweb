const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const WebsiteFeedback = sequelize.define('WebsiteFeedback', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    websiteId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    signal: {
      type: DataTypes.ENUM('useful', 'not_useful'),
      allowNull: false,
    },
    triedIt: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { len: [0, 500] },
    },
    ipHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  }, {
    tableName: 'website_feedback',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['website_id'] },
      { unique: true, fields: ['website_id', 'ip_hash'], name: 'one_feedback_per_visitor' },
    ],
  });

  WebsiteFeedback.hashVisitor = function hashVisitor(ip) {
    const secret = process.env.IP_HASH_SECRET || process.env.JWT_SECRET || 'findtheweb-development-only';
    return crypto.createHmac('sha256', secret).update(String(ip || 'unknown')).digest('hex');
  };

  WebsiteFeedback.associate = function associate(models) {
    WebsiteFeedback.belongsTo(models.Website, { foreignKey: 'websiteId', as: 'website' });
  };

  return WebsiteFeedback;
};

