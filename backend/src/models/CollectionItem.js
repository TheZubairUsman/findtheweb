module.exports = (sequelize, DataTypes) => {
  const CollectionItem = sequelize.define('CollectionItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    collectionId: { type: DataTypes.UUID, allowNull: false },
    websiteId: { type: DataTypes.UUID, allowNull: false },
    note: { type: DataTypes.STRING(280), allowNull: false, defaultValue: '' },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    indexes: [{ unique: true, fields: ['collectionId', 'websiteId'] }],
  });
  CollectionItem.associate = (models) => {
    CollectionItem.belongsTo(models.Collection, { foreignKey: 'collectionId', as: 'collection' });
    CollectionItem.belongsTo(models.Website, { foreignKey: 'websiteId', as: 'website' });
  };
  return CollectionItem;
};
