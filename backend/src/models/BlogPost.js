module.exports = (sequelize, DataTypes) => {
  const BlogPost = sequelize.define('BlogPost', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 255],
      },
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    categories: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seoKeywords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    readingTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    allowComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    tableName: 'blog_posts',
    hooks: {
      beforeValidate: (blogPost) => {
        // Generate slug if not provided
        if (!blogPost.slug && blogPost.title) {
          blogPost.slug = blogPost.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
      beforeBulkCreate: (blogPosts) => {
        blogPosts.forEach((blogPost) => {
          if (!blogPost.slug && blogPost.title) {
            blogPost.slug = blogPost.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
          }
          if (blogPost.status === 'published' && !blogPost.publishedAt) {
            blogPost.publishedAt = new Date();
          }
        });
      },
      beforeCreate: (blogPost) => {
        
        // Calculate reading time (average 200 words per minute)
        if (blogPost.content) {
          const wordCount = blogPost.content.split(/\s+/).length;
          blogPost.readingTime = Math.ceil(wordCount / 200);
        }
        
        // Set published date if status is published
        if (blogPost.status === 'published' && !blogPost.publishedAt) {
          blogPost.publishedAt = new Date();
        }
      },
      beforeUpdate: (blogPost) => {
        // Update reading time if content changed
        if (blogPost.changed('content')) {
          const wordCount = blogPost.content.split(/\s+/).length;
          blogPost.readingTime = Math.ceil(wordCount / 200);
        }
        
        // Set published date when status changes to published
        if (blogPost.changed('status') && blogPost.status === 'published' && !blogPost.publishedAt) {
          blogPost.publishedAt = new Date();
        }
        
        // Clear published date if status changes from published
        if (blogPost.changed('status') && blogPost.status !== 'published') {
          blogPost.publishedAt = null;
        }
      },
    },
    scopes: {
      published: {
        where: {
          status: 'published',
        },
      },
      featured: {
        where: {
          featured: true,
        },
      },
    },
  });

  // Instance methods
  BlogPost.prototype.incrementViewCount = async function() {
    await this.increment('viewCount');
    this.viewCount += 1;
    return this;
  };

  BlogPost.prototype.getRelatedPosts = async function(limit = 3) {
    const relatedPosts = await BlogPost.scope('published').findAll({
      where: {
        id: { [sequelize.Sequelize.Op.ne]: this.id },
        [sequelize.Sequelize.Op.or]: [
          { categories: { [sequelize.Sequelize.Op.overlap]: this.categories } },
          { tags: { [sequelize.Sequelize.Op.overlap]: this.tags } },
        ],
      },
      limit,
      order: [['publishedAt', 'DESC']],
    });
    
    return relatedPosts;
  };

  // Static methods
  BlogPost.findBySlug = function(slug) {
    return this.findOne({ where: { slug } });
  };

  BlogPost.getPublished = function(options = {}) {
    return this.scope('published').findAll({
      order: [['publishedAt', 'DESC']],
      ...options,
    });
  };

  BlogPost.getFeatured = function(limit = 3) {
    return this.scope(['published', 'featured']).findAll({
      limit,
      order: [['publishedAt', 'DESC']],
    });
  };

  BlogPost.getByCategory = function(category, options = {}) {
    return this.scope('published').findAll({
      where: {
        categories: {
          [sequelize.Sequelize.Op.contains]: [category],
        },
      },
      order: [['publishedAt', 'DESC']],
      ...options,
    });
  };

  BlogPost.getByTag = function(tag, options = {}) {
    return this.scope('published').findAll({
      where: {
        tags: {
          [sequelize.Sequelize.Op.contains]: [tag],
        },
      },
      order: [['publishedAt', 'DESC']],
      ...options,
    });
  };

  BlogPost.search = function(query, options = {}) {
    return this.scope('published').findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { title: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
          { excerpt: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
          { content: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        ],
      },
      order: [['publishedAt', 'DESC']],
      ...options,
    });
  };

  // Associations
  BlogPost.associate = function(models) {
    BlogPost.belongsTo(models.Admin, {
      foreignKey: 'authorId',
      as: 'author',
    });
  };

  return BlogPost;
};
