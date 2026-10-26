module.exports = (sequelize, DataTypes) => sequelize.define('ContactMessage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(254), allowNull: false },
  subject: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'new' },
}, { tableName: 'contact_messages', timestamps: true });
