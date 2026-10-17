const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    parentId: {
      type: DataTypes.UUID,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    icon: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    listingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    hooks: {
      beforeCreate: async (category) => {
        category.slug = await Category.generateUniqueSlug(category.name);
      },
      beforeUpdate: async (category) => {
        if (category.changed('name')) {
          category.slug = await Category.generateUniqueSlug(category.name, category.id);
        }
      },
    },
  });

  // Class methods
  Category.generateUniqueSlug = async function(name, id = null) {
    let slug = slugify(name, { lower: true, strict: true });
    const where = { slug };
    
    if (id) {
      where.id = { [sequelize.Sequelize.Op.ne]: id };
    }

    const existing = await this.count({ where });
    
    if (existing > 0) {
      const suffix = Math.floor(Math.random() * 10000);
      slug = `${slug}-${suffix}`;
    }

    return slug;
  };

  // Associations
  Category.associate = function(models) {
    Category.belongsTo(models.Category, { 
      foreignKey: 'parentId', 
      as: 'parent' 
    });
    Category.hasMany(models.Category, { 
      foreignKey: 'parentId', 
      as: 'children' 
    });
    Category.hasMany(models.Website, { 
      foreignKey: 'categoryId' 
    });
  };

  return Category;
};
