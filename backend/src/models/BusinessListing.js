const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const BusinessListing = sequelize.define('BusinessListing', {
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
        len: [3, 100],
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 5000],
      },
    },
    shortDescription: {
      type: DataTypes.STRING(200),
      validate: {
        len: [0, 200],
      },
    },
    website: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    logo: {
      type: DataTypes.STRING,
    },
    coverImage: {
      type: DataTypes.STRING,
    },
    gallery: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'draft',
        'pending',
        'published',
        'rejected',
        'suspended',
        'expired'
      ),
      defaultValue: 'draft',
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    businessHours: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    attributes: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    seoTitle: {
      type: DataTypes.STRING,
    },
    seoDescription: {
      type: DataTypes.TEXT,
    },
    seoKeywords: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
    subscriptionPlanId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'pending', 'expired', 'canceled'),
      defaultValue: 'pending',
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'BusinessListing',
    tableName: 'business_listings',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (listing) => {
        listing.slug = await BusinessListing.generateUniqueSlug(listing.name);
      },
      beforeUpdate: async (listing) => {
        if (listing.changed('name')) {
          listing.slug = await BusinessListing.generateUniqueSlug(listing.name, listing.id);
        }
      },
    },
  });

  // Class methods
  BusinessListing.generateUniqueSlug = async function(name, id = null) {
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

  // Instance methods
  BusinessListing.prototype.incrementViews = function() {
    return this.increment('views', { by: 1 });
  };

  // Associations
  BusinessListing.associate = function(models) {
    BusinessListing.belongsTo(models.Admin, { foreignKey: 'adminId', as: 'admin' });
    BusinessListing.belongsTo(models.Category, { foreignKey: 'categoryId' });
    BusinessListing.belongsTo(models.SubscriptionPlan, { foreignKey: 'subscriptionPlanId' });
  };

  return BusinessListing;
};
