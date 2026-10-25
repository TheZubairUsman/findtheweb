const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const CommunityProfile = sequelize.define('CommunityProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    ownerType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
    handle: { type: DataTypes.STRING(40), allowNull: false },
    displayName: { type: DataTypes.STRING(100), allowNull: false },
    bio: { type: DataTypes.STRING(280), allowNull: false, defaultValue: '' },
    avatarUrl: { type: DataTypes.STRING(500), allowNull: true },
    isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    indexes: [
      { unique: true, fields: ['ownerId', 'ownerType'] },
      { unique: true, fields: ['handle'] },
    ],
    hooks: {
      beforeValidate: (profile) => {
        if (profile.handle) profile.handle = slugify(profile.handle, { lower: true, strict: true }).slice(0, 40);
      },
    },
  });

  CommunityProfile.associate = (models) => {
    CommunityProfile.hasMany(models.Collection, { foreignKey: 'ownerId', sourceKey: 'ownerId', as: 'collections', constraints: false });
    CommunityProfile.hasMany(models.ProfileFollow, { foreignKey: 'followingId', sourceKey: 'ownerId', as: 'followers', constraints: false });
  };
  return CommunityProfile;
};
