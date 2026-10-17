module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'draft', 'archived'),
      defaultValue: 'draft',
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidFeatures(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Features must be an array');
          }
        },
      },
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidImages(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Images must be an array');
          }
        },
      },
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidTags(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
        },
      },
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: [1, 100],
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidDimensions(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Dimensions must be an object');
          }
        },
      },
    },
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 255],
      },
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seoKeywords: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    featuredOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    purchaseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  }, {
    hooks: {
      beforeCreate: (product) => {
        // Generate SKU if not provided
        if (!product.sku) {
          product.sku = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
        
        // Generate slug from name if not provided
        if (!product.slug) {
          product.slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
      beforeUpdate: (product) => {
        // Update slug if name changed
        if (product.changed('name') && !product.changed('slug')) {
          product.slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
    },
    scopes: {
      active: {
        where: {
          status: 'active',
        },
      },
      featured: {
        where: {
          featured: true,
        },
        order: [['featuredOrder', 'ASC']],
      },
      inStock: {
        where: {
          stock: {
            [sequelize.Sequelize.Op.gt]: 0,
          },
        },
      },
    },
  });

  // Instance methods
  Product.prototype.getFormattedPrice = function() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(this.price);
  };

  Product.prototype.incrementViewCount = async function() {
    this.viewCount += 1;
    await this.save();
    return this;
  };

  Product.prototype.incrementPurchaseCount = async function(quantity = 1) {
    this.purchaseCount += quantity;
    await this.save();
    return this;
  };

  Product.prototype.updateStock = async function(quantity) {
    if (this.stock + quantity < 0) {
      throw new Error('Insufficient stock');
    }
    this.stock += quantity;
    await this.save();
    return this;
  };

  Product.prototype.isInStock = function() {
    return this.stock > 0;
  };

  Product.prototype.getMainImage = function() {
    return this.images && this.images.length > 0 ? this.images[0] : null;
  };

  Product.prototype.getThumbnail = function() {
    const mainImage = this.getMainImage();
    if (!mainImage) return null;
    
    // If image is an object with thumbnail property
    if (typeof mainImage === 'object' && mainImage.thumbnail) {
      return mainImage.thumbnail;
    }
    
    // If image is a string URL
    if (typeof mainImage === 'string') {
      return mainImage;
    }
    
    return null;
  };

  // Class methods
  Product.findByCategory = function(category) {
    return this.findAll({
      where: { category },
      order: [['createdAt', 'DESC']],
    });
  };

  Product.findFeatured = function(limit = 10) {
    return this.findAll({
      where: { 
        featured: true,
        status: 'active',
      },
      order: [['featuredOrder', 'ASC'], ['createdAt', 'DESC']],
      limit,
    });
  };

  Product.search = function(query, options = {}) {
    const { limit = 20, offset = 0, category, status = 'active' } = options;
    
    const where = {
      status,
    };
    
    if (category) {
      where.category = category;
    }
    
    if (query) {
      where[sequelize.Sequelize.Op.or] = [
        { name: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        { description: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        { tags: { [sequelize.Sequelize.Op.contains]: [query] } },
      ];
    }
    
    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  };

  return Product;
};
