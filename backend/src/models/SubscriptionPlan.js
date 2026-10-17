module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
      defaultValue: 'monthly',
      field: 'billing_cycle',
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    maxListings: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'max_listings',
      validate: {
        min: 1,
      },
    },
    maxImages: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'max_images',
      validate: {
        min: 1,
      },
    },
    hasFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_featured',
    },
    hasUrgent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_urgent',
    },
    hasHighlight: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_highlight',
    },
    hasVideo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_video',
    },
    hasSocialLinks: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_social_links',
    },
    hasContactForm: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_contact_form',
    },
    hasMap: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_map',
    },
    hasWebsiteLink: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_website_link',
    },
    hasPhoneNumber: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_phone_number',
    },
    hasEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_email',
    },
    hasAddress: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_address',
    },
    hasBusinessHours: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_business_hours',
    },
    hasGallery: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_gallery',
    },
    hasReviews: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_reviews',
    },
    hasSocialSharing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_social_sharing',
    },
    hasSeo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_seo',
    },
    hasAnalytics: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_analytics',
    },
    hasCustomDomain: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_custom_domain',
    },
    hasPrioritySupport: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_priority_support',
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_popular',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (plan) => {
        if (!plan.slug) {
          plan.slug = plan.name.toLowerCase().replace(/\s+/g, '-');
        }
      },
      beforeUpdate: async (plan) => {
        if (plan.changed('name') && !plan.changed('slug')) {
          plan.slug = plan.name.toLowerCase().replace(/\s+/g, '-');
        }
      },
    },
  });

  // Associations
  SubscriptionPlan.associate = function(models) {
    SubscriptionPlan.hasMany(models.BusinessListing, { 
      foreignKey: 'subscriptionPlanId' 
    });
  };

  return SubscriptionPlan;
};
