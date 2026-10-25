module.exports = (sequelize, DataTypes) => {
  const ProfileFollow = sequelize.define('ProfileFollow', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    followerId: { type: DataTypes.UUID, allowNull: false },
    followingId: { type: DataTypes.UUID, allowNull: false },
    followerType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
    followingType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
  }, {
    indexes: [{ unique: true, fields: ['followerId', 'followerType', 'followingId', 'followingType'] }],
  });
  return ProfileFollow;
};
