const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Website = sequelize.define('Website', {
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
        len: [1, 200],
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    tier: {
      type: DataTypes.ENUM('standard', 'premium', 'enterprise'),
      defaultValue: 'standard',
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    screenshot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalHits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    weeklyHits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    monthlyHits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dailyHits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    submittedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submitterEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'active',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  });

  // Instance methods
  Website.prototype.incrementHits = async function() {
    await this.increment(['totalHits', 'weeklyHits', 'monthlyHits'], { by: 1 });
    this.totalHits += 1;
    this.weeklyHits += 1;
    this.monthlyHits += 1;
    return this;
  };

  // Scopes
  Website.addScope('byTier', (tier) => ({
    where: {
      tier: tier.toLowerCase(),
      status: 'active'
    }
  }));

  Website.addScope('topHits', (period = 'week') => {
    const hitField = period === 'day' ? 'dailyHits' : 
                    period === 'month' ? 'monthlyHits' : 'weeklyHits';
    
    return {
      where: {
        status: 'active'
      },
      order: [[hitField, 'DESC'], ['totalHits', 'DESC']]
    };
  });

  // Associations
  Website.associate = function(models) {
    Website.hasMany(models.Hit, { foreignKey: 'websiteId' });
    Website.hasMany(models.WebsiteFeedback, { foreignKey: 'websiteId', as: 'feedback' });
    Website.belongsTo(models.Category, { 
      foreignKey: 'categoryId', 
      as: 'category',
      allowNull: true 
    });
  };

  return Website;
};

