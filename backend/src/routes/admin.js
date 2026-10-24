const express = require('express');
const { Op } = require('sequelize');
const {
  getDashboardStats,
  getDetailedStats,
  bulkUploadData,
  exportData,
  getUserManagement,
  getPendingComments,
  cleanupOldData,
} = require('../controllers/adminController');

// Import models from index.js to ensure proper initialization
const { Admin, Settings, Website, Post, BlogPost } = require('../models');

const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router({ mergeParams: true });

// Import centralized authentication middleware
const { authenticateAdmin } = require('../middleware/auth');

// Rate limiting for admin operations
const adminLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 admin requests per windowMs
  message: 'Too many admin requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for bulk operations
const bulkOperationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 bulk operations per hour
  message: 'Too many bulk operations from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateCleanup = [
  body('type').isIn(['hits', 'votes']).withMessage('Type must be "hits" or "votes"'),
  body('days').isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
];

// All admin routes require authentication
router.use(authenticateAdmin);
router.use(adminLimit);

// Data storage paths (same as main server)
const dataDir = path.join(__dirname, '../../data');
const websitesFile = path.join(dataDir, 'websites.json');
const postsFile = path.join(dataDir, 'posts.json');
const analyticsFile = path.join(dataDir, 'analytics-events.json');

// Helper functions for JSON file operations
const readData = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

// Dashboard routes - use the proper controller
router.route('/dashboard').get(getDashboardStats);

// Public blog endpoints (no auth required)
router.route('/blog/posts').get(async (req, res) => {
  try {
    const { page = 1, limit = 9, category, tag, search } = req.query;
    const posts = readData(postsFile);
    
    // Filter only published posts for public access
    let filteredPosts = posts.filter(post => post.status === 'published');
    
    // Apply filters
    if (category) {
      filteredPosts = filteredPosts.filter(post => 
        post.categories && post.categories.includes(category)
      );
    }
    
    if (tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags && post.tags.includes(tag)
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title?.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by published date
    filteredPosts.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    // Get featured posts
    const featuredPosts = posts.filter(post => post.status === 'published' && post.featured).slice(0, 3);
    
    res.json({
      success: true,
      data: paginatedPosts,
      featured: featuredPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredPosts.length,
        pages: Math.ceil(filteredPosts.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public blog posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
  }
});

router.route('/blog/posts/:slug').get(async (req, res) => {
  try {
    const { slug } = req.params;
    const posts = readData(postsFile);
    
    const post = posts.find(p => p.slug === slug && p.status === 'published');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1;
    writeData(postsFile, posts);
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog post' });
  }
});

// Categories endpoint
router.route('/categories').get(async (req, res) => {
  try {
    const categoriesFile = path.join(dataDir, 'categories.json');
    const categories = readData(categoriesFile);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories' 
    });
  }
});

// Debug endpoint to test database connection and models
router.route('/debug').get(async (req, res) => {
  try {
    const models = require('../models');
    
    // Test database connection
    await models.sequelize.authenticate();
    
    // Get available tables
    const [tables] = await models.sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    
    // Test model availability
    const modelTests = {};
    
    // Test Website model
    try {
      if (models.Website) {
        const websiteCount = await models.Website.count();
        const sampleWebsite = await models.Website.findOne();
        modelTests.Website = { 
          available: true, 
          count: websiteCount,
          sample: sampleWebsite ? { id: sampleWebsite.id, name: sampleWebsite.name } : null
        };
      } else {
        modelTests.Website = { available: false, error: 'Model not found' };
      }
    } catch (error) {
      modelTests.Website = { available: false, error: error.message };
    }
    
    // Test Post model
    try {
      if (models.Post) {
        const postCount = await models.Post.count();
        modelTests.Post = { available: true, count: postCount };
      } else {
        modelTests.Post = { available: false, error: 'Model not found' };
      }
    } catch (error) {
      modelTests.Post = { available: false, error: error.message };
    }
    
    res.json({
      success: true,
      debug: {
        databaseConnected: true,
        availableTables: tables.map(t => t.name),
        availableModels: Object.keys(models).filter(key => key !== 'sequelize' && key !== 'Sequelize'),
        modelTests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        databaseConnected: false
      }
    });
  }
});

router.route('/stats').get(async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate = new Date();

    // Calculate start date based on period
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'week':
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const websites = readData(websitesFile);
    const posts = readData(postsFile);
    const analyticsEvents = readData(analyticsFile);
    const analytics = analyticsEvents.reduce((summary, item) => {
      summary.total += 1;
      summary.byEvent[item.event] = (summary.byEvent[item.event] || 0) + 1;
      return summary;
    }, { total: 0, byEvent: {} });

    const totalWebsites = websites.length;
    const totalPosts = posts.length;

    const websitesByTier = {};
    websites.forEach(site => {
      if (!websitesByTier[site.tier]) {
        websitesByTier[site.tier] = 0;
      }
      websitesByTier[site.tier]++;
    });

    const recentWebsites = websites.slice(0, 5);
    const recentPosts = posts.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalWebsites,
        totalPosts,
        websitesByTier,
        recentWebsites,
        recentPosts,
        analytics
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

router.route('/websites')
  .get(async (req, res) => {
    try {
      const { page = 1, limit = 10, search, tier, status } = req.query;
      
      // Read websites from JSON file
      const websites = readData(websitesFile);
      
      let filteredWebsites = websites;
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredWebsites = filteredWebsites.filter(site => 
          site.name?.toLowerCase().includes(searchLower) ||
          site.url?.toLowerCase().includes(searchLower) ||
          site.description?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply tier filter
      if (tier) {
        filteredWebsites = filteredWebsites.filter(site => site.tier === tier);
      }
      
      // Apply status filter
      if (status) {
        filteredWebsites = filteredWebsites.filter(site => site.status === status);
      }
      
      // Sort by creation date (newest first)
      filteredWebsites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedWebsites = filteredWebsites.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: paginatedWebsites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredWebsites.length,
          pages: Math.ceil(filteredWebsites.length / limit)
        },
        totalPages: Math.ceil(filteredWebsites.length / limit)
      });
    } catch (error) {
      console.error('Error fetching websites:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch websites' });
    }
  })
  .post(async (req, res) => {
    try {
      const websites = readData(websitesFile);
      const newWebsite = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalHits: 0,
        weeklyHits: 0,
        monthlyHits: 0,
        dailyHits: 0
      };
      
      websites.push(newWebsite);
      writeData(websitesFile, websites);
      
      res.status(201).json({
        success: true,
        data: newWebsite,
        message: 'Website created successfully'
      });
    } catch (error) {
      console.error('Error creating website:', error);
      res.status(500).json({ success: false, message: 'Failed to create website' });
    }
  });

router.route('/websites/:id')
  .put(async (req, res) => {
    try {
      const { id } = req.params;
      const websites = readData(websitesFile);
      const index = websites.findIndex(site => site.id === id);
      
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      websites[index] = { 
        ...websites[index], 
        ...req.body, 
        updatedAt: new Date().toISOString() 
      };
      writeData(websitesFile, websites);
      
      res.json({
        success: true,
        data: websites[index],
        message: 'Website updated successfully'
      });
    } catch (error) {
      console.error('Error updating website:', error);
      res.status(500).json({ success: false, message: 'Failed to update website' });
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      const websites = readData(websitesFile);
      const filtered = websites.filter(site => site.id !== id);
      
      if (filtered.length === websites.length) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      writeData(websitesFile, filtered);
      res.json({
        success: true,
        message: 'Website deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting website:', error);
      res.status(500).json({ success: false, message: 'Failed to delete website' });
    }
  });

router.route('/posts')
  .get(async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const where = {};
      if (status && status !== 'all') where.status = status;
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
        ];
      }
      const result = await BlogPost.findAndCountAll({
        where,
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        order: [['createdAt', 'DESC']],
      });
      const data = result.rows.map((post) => post.toJSON());
      res.json({
        success: true,
        data,
        total: result.count,
        page: parseInt(page, 10),
        totalPages: Math.ceil(result.count / parseInt(limit, 10)),
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: result.count, pages: Math.ceil(result.count / parseInt(limit, 10)) },
      });
    } catch (error) {
      console.error('Error fetching canonical blog posts:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch blog posts' });
    }
  })
  .post(async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });
      const post = await BlogPost.create({
        ...req.body,
        title,
        content,
        categories: Array.isArray(req.body.categories) ? req.body.categories : [],
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
        status: req.body.status || 'draft',
        authorId: req.user.id,
      });
      res.status(201).json({ success: true, data: post.toJSON(), message: 'Post created successfully' });
    } catch (error) {
      console.error('Error creating canonical blog post:', error);
      const message = error.name === 'SequelizeUniqueConstraintError' ? 'Slug already exists' : 'Failed to create blog post';
      res.status(400).json({ success: false, message });
    }
  });

router.route('/posts/:id')
  .put(async (req, res) => {
    try {
      const post = await BlogPost.findByPk(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      await post.update(req.body);
      res.json({ success: true, data: post.toJSON(), message: 'Post updated successfully' });
    } catch (error) {
      console.error('Error updating canonical blog post:', error);
      const message = error.name === 'SequelizeUniqueConstraintError' ? 'Slug already exists' : 'Failed to update blog post';
      res.status(400).json({ success: false, message });
    }
  })
  .delete(async (req, res) => {
    try {
      const post = await BlogPost.findByPk(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      await post.destroy();
      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting canonical blog post:', error);
      res.status(500).json({ success: false, message: 'Failed to delete blog post' });
    }
  });

// Data management routes
router.route('/upload').post(bulkOperationLimit, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { type } = req.body;
    if (type !== 'websites') {
      return res.status(400).json({ success: false, message: 'Invalid upload type' });
    }
    
    const fileContent = req.file.buffer.toString('utf8');
    let uploadData;
    
    try {
      uploadData = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ success: false, message: 'Invalid JSON format' });
    }
    
    if (!Array.isArray(uploadData)) {
      return res.status(400).json({ success: false, message: 'JSON must contain an array of websites' });
    }
    
    const websites = readData(websitesFile);
    let addedCount = 0;
    
    for (const websiteData of uploadData) {
      // Validate required fields
      if (!websiteData.name || !websiteData.url) {
        continue; // Skip invalid entries
      }
      
      // Check if website already exists
      const existingWebsite = websites.find(site => site.url === websiteData.url);
      if (existingWebsite) {
        continue; // Skip duplicates
      }
      
      const newWebsite = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: websiteData.name,
        url: websiteData.url,
        description: websiteData.description || '',
        tier: websiteData.tier || 'standard',
        status: websiteData.status || 'active',
        categoryId: websiteData.categoryId || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalHits: 0,
        weeklyHits: 0
      };
      
      websites.push(newWebsite);
      addedCount++;
    }
    
    writeData(websitesFile, websites);
    
    res.json({
      success: true,
      message: `Successfully uploaded ${addedCount} websites`,
      count: addedCount
    });
  } catch (error) {
    console.error('Error uploading websites:', error);
    res.status(500).json({ success: false, message: 'Failed to upload websites' });
  }
});

router.route('/export').get(exportData);

router.route('/cleanup').post(validateCleanup, cleanupOldData);

// Categories endpoint with CRUD operations
router.route('/categories')
  .get(async (req, res) => {
    try {
      // Read categories from JSON file or use defaults
      const categoriesFile = path.join(dataDir, 'categories.json');
      let categories;
      
      if (fs.existsSync(categoriesFile)) {
        categories = readData(categoriesFile);
      } else {
        // Default categories
        categories = [
          { id: 1, name: 'Technology', slug: 'technology', description: 'Technology and software related websites' },
          { id: 2, name: 'Business', slug: 'business', description: 'Business and finance related websites' },
          { id: 3, name: 'Education', slug: 'education', description: 'Educational resources and learning platforms' },
          { id: 4, name: 'Entertainment', slug: 'entertainment', description: 'Entertainment and media websites' },
          { id: 5, name: 'Health', slug: 'health', description: 'Health and wellness resources' },
          { id: 6, name: 'News', slug: 'news', description: 'News and current affairs websites' },
          { id: 7, name: 'Social', slug: 'social', description: 'Social media and networking platforms' },
          { id: 8, name: 'Tools', slug: 'tools', description: 'Productivity tools and utilities' },
          { id: 9, name: 'Finance', slug: 'finance', description: 'Financial services and investment platforms' },
          { id: 10, name: 'Travel', slug: 'travel', description: 'Travel and tourism websites' }
        ];
        // Save default categories
        writeData(categoriesFile, categories);
      }
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  })
  .post(async (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }
      
      const categoriesFile = path.join(dataDir, 'categories.json');
      const categories = readData(categoriesFile);
      
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      // Check if category already exists
      const existingCategory = categories.find(cat => cat.slug === slug);
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
      
      const newCategory = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        name: name.trim(),
        slug,
        description: description?.trim() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      categories.push(newCategory);
      writeData(categoriesFile, categories);
      
      res.status(201).json({
        success: true,
        data: newCategory,
        message: 'Category created successfully'
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, message: 'Failed to create category' });
    }
  });

router.route('/categories/:id')
  .put(async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }
      
      const categoriesFile = path.join(dataDir, 'categories.json');
      const categories = readData(categoriesFile);
      const index = categories.findIndex(cat => cat.id === parseInt(id));
      
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      
      // Generate new slug
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      // Check if slug conflicts with other categories
      const existingCategory = categories.find(cat => cat.slug === slug && cat.id !== parseInt(id));
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category with this name already exists' });
      }
      
      categories[index] = {
        ...categories[index],
        name: name.trim(),
        slug,
        description: description?.trim() || '',
        updatedAt: new Date().toISOString()
      };
      
      writeData(categoriesFile, categories);
      
      res.json({
        success: true,
        data: categories[index],
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ success: false, message: 'Failed to update category' });
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      const categoriesFile = path.join(dataDir, 'categories.json');
      const categories = readData(categoriesFile);
      
      const categoryIndex = categories.findIndex(cat => cat.id === parseInt(id));
      if (categoryIndex === -1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      
      // Check if category is being used by any websites
      const websites = readData(websitesFile);
      const websitesUsingCategory = websites.filter(site => site.categoryId === parseInt(id));
      
      if (websitesUsingCategory.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot delete category. It is being used by ${websitesUsingCategory.length} website(s)` 
        });
      }
      
      categories.splice(categoryIndex, 1);
      writeData(categoriesFile, categories);
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
  });

// User management routes
router.route('/users')
  .get(async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      
      // Get admin users from database
      const whereClause = {};
      
      // Apply search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Apply status filter
      if (status) {
        whereClause.isActive = status === 'active';
      }

      const { count, rows: users } = await Admin.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: users,
        total: count,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  })
  .post(async (req, res) => {
    try {
      console.log('🔵 POST /admin/users - Request body:', req.body);
      
      const { name, email, password, isActive = true } = req.body;
      
      // Validate required fields
      if (!name || !email || !password) {
        console.log('❌ Validation failed - missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Check if admin already exists
      console.log('🔵 Checking for existing admin with email:', email);
      const existingAdmin = await Admin.findOne({ where: { email } });
      if (existingAdmin) {
        console.log('❌ Admin already exists with email:', email);
        return res.status(400).json({
          success: false,
          message: 'Admin with this email already exists'
        });
      }

      // Create new admin
      console.log('🔵 Creating new admin:', { name, email, isActive });
      const newAdmin = await Admin.create({
        name,
        email,
        password,
        isActive
      });

      console.log('✅ Admin created successfully:', newAdmin.id);

      // Return admin without password
      const adminData = newAdmin.toJSON();
      delete adminData.password;

      const response = {
        success: true,
        data: adminData,
        message: 'Admin created successfully'
      };

      console.log('🔵 Sending response:', response);
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ Error creating admin:', error);
      res.status(500).json({ success: false, message: 'Failed to create admin' });
    }
  });

router.route('/users/:id')
  .put(async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, status } = req.body;
      
      // Mock user update - replace with actual database operations
      const updatedUser = {
        id: parseInt(id),
        name,
        email,
        role,
        status,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock user deletion - replace with actual database operations
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  });

// Settings management routes
router.route('/settings')
  .get(async (req, res) => {
    try {
      const settings = await Settings.getAll();

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch settings',
        error: error.message 
      });
    }
  })
  .post(async (req, res) => {
    try {
      const settingsData = req.body;
      
      // Validate required settings
      const requiredSettings = ['siteName', 'siteDescription', 'adminEmail'];
      for (const key of requiredSettings) {
        if (!settingsData[key]) {
          return res.status(400).json({
            success: false,
            message: `${key} is required`
          });
        }
      }
      
      // Save settings using the Settings model
      const results = [];
      for (const [key, value] of Object.entries(settingsData)) {
        try {
          const setting = await Settings.set(key, value);
          results.push(setting);
        } catch (error) {
          console.error(`Error saving setting ${key}:`, error);
          // Continue with other settings even if one fails
        }
      }
      
      res.json({
        success: true,
        data: settingsData,
        message: 'Settings saved successfully',
        savedCount: results.length
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save settings',
        error: error.message 
      });
    }
  });

// User management routes
router.route('/users').get(getUserManagement);

// Content moderation routes
router.route('/comments/pending').get(getPendingComments);

// Simple comment management placeholders
router.route('/comments/:id')
  .put(async (req, res) => {
    res.json({ success: true, message: 'Comment updated successfully' });
  })
  .delete(async (req, res) => {
    res.json({ success: true, message: 'Comment deleted successfully' });
  });

// Product management routes
router.route('/products')
  .get(async (req, res) => {
    try {
      console.log('Admin products GET request received');
      console.log('Query params:', req.query);
      console.log('User:', req.user?.email);
      
      const { page = 1, limit = 10, search, category, status } = req.query;
      
      // For now, return mock data since we don't have a Product model yet
      const mockProducts = [
        {
          id: 1,
          name: 'Sample Product 1',
          description: 'This is a sample product for testing',
          price: 29.99,
          category: 'productivity',
          status: 'active',
          features: ['Feature 1', 'Feature 2'],
          images: [],
          tags: ['sample', 'test'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Sample Product 2',
          description: 'Another sample product for testing',
          price: 49.99,
          category: 'development',
          status: 'draft',
          features: ['Feature A', 'Feature B'],
          images: [],
          tags: ['sample', 'development'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Apply filters if provided
      let filteredProducts = mockProducts;
      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      if (status && status !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.status === status);
      }
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredProducts.length,
            pages: Math.ceil(filteredProducts.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message
      });
    }
  })
  .post(async (req, res) => {
    try {
      console.log('Admin products POST request received');
      console.log('Request body:', req.body);
      console.log('User:', req.user?.email);
      
      const productData = req.body;
      
      // Basic validation
      if (!productData.name || !productData.description || !productData.category) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, description, category'
        });
      }
      
      // For now, return mock success since we don't have a Product model yet
      const newProduct = {
        id: Date.now(), // Mock ID
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message
      });
    }
  });

router.route('/products/:id')
  .put(async (req, res) => {
    try {
      console.log('Admin products PUT request received');
      console.log('Product ID:', req.params.id);
      console.log('Request body:', req.body);
      console.log('User:', req.user?.email);
      
      const { id } = req.params;
      const productData = req.body;
      
      // For now, return mock success since we don't have a Product model yet
      const updatedProduct = {
        id: parseInt(id),
        ...productData,
        updatedAt: new Date()
      };
      
      res.json({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    }
  })
  .delete(async (req, res) => {
    try {
      console.log('Admin products DELETE request received');
      console.log('Product ID:', req.params.id);
      console.log('User:', req.user?.email);
      
      const { id } = req.params;
      
      // For now, return mock success since we don't have a Product model yet
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    }
  });

module.exports = router;

