const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200],
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    websiteId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    voteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    featuredImage: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  }, {
    hooks: {
      beforeCreate: async (post) => {
        post.slug = await Post.generateUniqueSlug(post.title);
      },
      beforeUpdate: async (post) => {
        if (post.changed('title')) {
          post.slug = await Post.generateUniqueSlug(post.title, post.id);
        }
      },
    },
  });

  // Class methods
  Post.generateUniqueSlug = async function(title, id = null) {
    let slug = slugify(title, { lower: true, strict: true });
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
  Post.prototype.updateCommentCount = async function() {
    const count = await sequelize.models.Comment.count({
      where: { postId: this.id, status: 'published' }
    });
    return this.update({ commentCount: count });
  };

  Post.prototype.updateVoteCount = async function() {
    const upvotes = await sequelize.models.Vote.count({
      where: { postId: this.id, type: 'upvote' }
    });
    const downvotes = await sequelize.models.Vote.count({
      where: { postId: this.id, type: 'downvote' }
    });
    return this.update({ voteCount: upvotes - downvotes });
  };

  // Associations
  Post.associate = function(models) {
    Post.belongsTo(models.Admin, { foreignKey: 'authorId', as: 'author' });
    Post.belongsTo(models.Website, { 
      foreignKey: 'websiteId', 
      as: 'website',
      allowNull: true 
    });
    Post.belongsTo(models.Category, { 
      foreignKey: 'categoryId', 
      as: 'category',
      allowNull: true 
    });
    Post.hasMany(models.Comment, { foreignKey: 'postId' });
    Post.hasMany(models.Vote, { foreignKey: 'postId' });
  };

  return Post;
};
