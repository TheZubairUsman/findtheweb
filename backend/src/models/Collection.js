module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define('Collection', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    ownerType: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'user' },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: false, defaultValue: '' },
    isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    indexes: [{ unique: true, fields: ['ownerId', 'ownerType', 'name'] }],
  });
  Collection.associate = (models) => {
    Collection.hasMany(models.CollectionItem, { foreignKey: 'collectionId', as: 'items', onDelete: 'CASCADE' });
  };
  return Collection;
};
