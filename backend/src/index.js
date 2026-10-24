const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const { sequelize, Admin, BlogPost } = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routers
const adminRouter = require('./routes/admin');
const productRouter = require('./routes/products');
const websiteRouter = require('./routes/websites');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting for all requests
const generalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

app.use(generalLimit);

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'cache-control',
    'pragma',
    'expires',
    'x-auth-token'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600, // 10 minutes
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000 })); // Reduced limits

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`${timestamp} - ${req.method} ${req.originalUrl} - IP: ${ip}`);
  next();
});

// Mount routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/websites', websiteRouter);

// Import routes
const authRoutes = require('./routes/auth');

// Apply auth rate limiting to auth routes
app.use('/api/v1/auth', authLimit);

// Mount routes with /api/v1 prefix
app.use('/api/v1/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FindTheWeb API is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: '/api/v1/auth/admin/login',
        register: '/api/v1/auth/register',
        verify: '/api/v1/auth/verify-email',
        forgotPassword: '/api/v1/auth/forgot-password',
        resetPassword: '/api/v1/auth/reset-password'
      },
      admin: {
        dashboard: '/api/v1/admin/dashboard',
        users: '/api/v1/admin/users',
        websites: '/api/v1/admin/websites'
      },
      websites: {
        list: '/api/v1/websites',
        tier: '/api/v1/websites/tier/:tier',
        top: '/api/v1/websites/top',
        hit: '/api/v1/websites/:id/hit',
        search: '/api/v1/websites/search'
      },
      docs: 'https://docs.findtheweb.com/api'
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Data storage paths
const dataDir = path.join(__dirname, '../data');
const websitesFile = path.join(dataDir, 'websites.json');
const postsFile = path.join(dataDir, 'posts.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const analyticsFile = path.join(dataDir, 'analytics-events.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(websitesFile)) {
  fs.writeFileSync(websitesFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(postsFile)) {
  fs.writeFileSync(postsFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(categoriesFile)) {
  fs.writeFileSync(categoriesFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(analyticsFile)) {
  fs.writeFileSync(analyticsFile, JSON.stringify([], null, 2));
}

// Helper functions
const readData = (filename) => {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};

const analyticsLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Analytics event limit reached' },
});

const allowedAnalyticsEvents = new Set([
  'page_view',
  'article_open',
  'product_click',
  'save_intent',
  'newsletter_interest',
]);

const cleanAnalyticsPath = (value) => {
  if (typeof value !== 'string') return '/';
  const normalized = value.trim().slice(0, 300);
  return normalized.startsWith('/') ? normalized : '/';
};

// Privacy-safe MVP analytics: no raw IP, email, cookie, or user-agent is stored.
app.post('/api/v1/analytics/events', analyticsLimit, (req, res) => {
  const { event, path: eventPath, slug, referrer } = req.body || {};
  if (!allowedAnalyticsEvents.has(event)) {
    return res.status(400).json({ success: false, message: 'Unsupported analytics event' });
  }

  const events = readData(analyticsFile);
  events.push({
    event,
    path: cleanAnalyticsPath(eventPath),
    slug: typeof slug === 'string' ? slug.trim().slice(0, 160) : undefined,
    referrer: typeof referrer === 'string' ? referrer.trim().slice(0, 200) : undefined,
    day: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  });

  // Keep this file bounded for the MVP; aggregate reporting happens from recent events.
  writeData(analyticsFile, events.slice(-10000));
  return res.status(202).json({ success: true, accepted: true });
});

// Import centralized authentication middleware
const { authenticateAdmin } = require('./middleware/auth');

const isAdminRequest = (req) => Boolean(req.admin || req.user?.role === 'admin');

// Remove duplicate website routes - now handled by websiteRouter

// Post routes
app.get('/api/v1/posts', (req, res) => {
  const posts = readData(postsFile);
  res.json({ success: true, data: posts });
});

app.post('/api/v1/posts', authenticateAdmin, (req, res) => {
  const posts = readData(postsFile);
  const newPost = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    voteCount: 0,
    commentCount: 0
  };
  posts.push(newPost);
  writeData(postsFile, posts);
  res.json({ success: true, data: newPost });
});

// Analytics and stats endpoints for admin
app.get('/api/v1/admin/stats', authenticateAdmin, (req, res) => {
  const websites = readData(websitesFile);
  const posts = readData(postsFile);
  const analyticsEvents = readData(analyticsFile);
  const analytics = analyticsEvents.reduce((summary, item) => {
    summary.total += 1;
    summary.byEvent[item.event] = (summary.byEvent[item.event] || 0) + 1;
    return summary;
  }, { total: 0, byEvent: {} });
  
  const stats = {
    totalWebsites: websites.length,
    totalPosts: posts.length,
    websitesByTier: {
      standard: websites.filter(w => w.tier === 'standard').length,
      premium: websites.filter(w => w.tier === 'premium').length,
      enterprise: websites.filter(w => w.tier === 'enterprise').length
    },
    recentWebsites: websites
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    recentPosts: posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    analytics
  };
  
  res.json({ success: true, data: stats });
});

// Blog routes
app.get('/api/v1/blog/posts', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tag, 
      search, 
      featured,
      status = 'published' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = {};
    
    // Filter by status (only published for public, all for admin)
    if (status === 'published') {
      whereClause.status = 'published';
      whereClause.publishedAt = { [sequelize.Sequelize.Op.lte]: new Date() };
    } else if (isAdminRequest(req)) {
      // Admin can see all statuses
      if (status !== 'all') {
        whereClause.status = status;
      }
    } else {
      // Non-admin can only see published
      whereClause.status = 'published';
      whereClause.publishedAt = { [sequelize.Sequelize.Op.lte]: new Date() };
    }
    
    // Filter by category
    if (category) {
      whereClause.categories = { [sequelize.Sequelize.Op.contains]: [category] };
    }
    
    // Filter by tag
    if (tag) {
      whereClause.tags = { [sequelize.Sequelize.Op.contains]: [tag] };
    }
    
    // Filter by featured
    if (featured === 'true') {
      whereClause.featured = true;
    }
    
    // Search functionality
    if (search) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { title: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } },
        { excerpt: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } },
        { content: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    
    const { count, rows } = await BlogPost.findAndCountAll({
      where: whereClause,
      include: [{
        model: Admin,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publishedAt', 'DESC']],
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/v1/blog/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await BlogPost.findOne({
      where: { slug },
      include: [{
        model: Admin,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      }],
    });
    
    if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });
    
    // Only allow published posts for non-admin users
    if (!isAdminRequest(req) && (post.status !== 'published' || post.publishedAt > new Date())) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    // Increment view count for published posts
    if (post.status === 'published') {
      await post.incrementViewCount();
    }
    
    // Related-post helpers use PostgreSQL array operators that SQLite does not
    // support. Keep detail pages healthy with a portable database-backed fallback.
    let relatedPosts = [];
    try {
      relatedPosts = await post.getRelatedPosts(3);
    } catch (relatedError) {
      const current = post.toJSON();
      const currentCategories = current.categories || [];
      const currentTags = current.tags || [];
      const publishedPosts = await BlogPost.scope('published').findAll({
        order: [['publishedAt', 'DESC']],
        limit: 100,
      });
      relatedPosts = publishedPosts.map((candidate) => candidate.toJSON())
        .filter((candidate) => candidate.slug !== slug)
        .filter((candidate) =>
          (candidate.categories || []).some((value) => currentCategories.includes(value)) ||
          (candidate.tags || []).some((value) => currentTags.includes(value))
        )
        .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
        .slice(0, 3);
    }
    
    res.json({
      success: true,
      data: {
        ...post.toJSON(),
        relatedPosts,
      },
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/v1/blog/posts', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status = 'draft',
      categories = [],
      tags = [],
      seoTitle,
      seoDescription,
      seoKeywords,
      featured = false,
      allowComments = true,
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }
    
    const post = await BlogPost.create({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      categories,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords,
      featured,
      allowComments,
      authorId: req.user.id,
    });
    
    const createdPost = await BlogPost.findByPk(post.id, {
      include: [{
        model: Admin,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      }],
    });
    
    res.status(201).json({ success: true, data: createdPost });
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ success: false, message: 'Slug already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

app.put('/api/v1/blog/posts/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      categories,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords,
      featured,
      allowComments,
    } = req.body;
    
    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    await post.update({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      categories,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords,
      featured,
      allowComments,
    });
    
    const updatedPost = await BlogPost.findByPk(id, {
      include: [{
        model: Admin,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      }],
    });
    
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Error updating blog post:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ success: false, message: 'Slug already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

app.delete('/api/v1/blog/posts/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    await post.destroy();
    
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Blog categories and tags endpoints
app.get('/api/v1/blog/categories', async (req, res) => {
  try {
    // SQLite-compatible approach: fetch all posts and extract categories
    const posts = await BlogPost.findAll({
      attributes: ['categories'],
      where: {
        status: 'published',
        categories: { [sequelize.Sequelize.Op.ne]: '[]' },
      },
      raw: true,
    });
    
    // Extract unique categories from all posts
    const categoriesSet = new Set();
    posts.forEach(post => {
      if (post.categories && Array.isArray(post.categories)) {
        post.categories.forEach(cat => {
          if (cat && cat.trim()) {
            categoriesSet.add(cat.trim());
          }
        });
      }
    });
    
    res.json({
      success: true,
      data: Array.from(categoriesSet).sort(),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.json({ success: true, data: ['Technology', 'Design', 'Business', 'Lifestyle'] });
  }
});

app.get('/api/v1/blog/tags', async (req, res) => {
  try {
    // SQLite-compatible approach: fetch all posts and extract tags
    const posts = await BlogPost.findAll({
      attributes: ['tags'],
      where: {
        status: 'published',
        tags: { [sequelize.Sequelize.Op.ne]: '[]' },
      },
      raw: true,
    });
    
    // Extract unique tags from all posts
    const tagsSet = new Set();
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        });
      }
    });
    
    const tags = Array.from(tagsSet).map(tag => ({ tag }));
    
    res.json({
      success: true,
      data: tags.map(t => t.tag).filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.json({ success: true, data: [] });
  }
});

// Categories endpoint for public use (home page dropdown)
app.get('/api/v1/categories', (req, res) => {
  try {
    const categoriesFile = path.join(dataDir, 'categories.json');
    let categories;
    
    if (fs.existsSync(categoriesFile)) {
      categories = readData(categoriesFile);
    } else {
      // Default categories if file doesn't exist
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
    }
    
    res.json({ 
      success: true, 
      data: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { error: err.message, stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Database initialization and server startup
const initializeDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully');

    // Bootstrap the first admin only from server-side environment variables.
    // Never ship fallback credentials or reset passwords during startup.
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      const defaultEmail = process.env.ADMIN_EMAIL;
      const defaultPassword = process.env.ADMIN_PASSWORD;

      if (!defaultEmail || !defaultPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to bootstrap the first admin');
      }
      
      // IMPORTANT: Do not pre-hash here; let the model hooks hash the password
      const [admin, created] = await Admin.findOrCreate({
        where: { email: defaultEmail },
        defaults: {
          email: defaultEmail,
          password: defaultPassword,
          name: process.env.ADMIN_NAME || 'Administrator',
          isActive: true
        }
      });
      
      if (created) console.log('Initial admin account created successfully:', admin.email);
    } else {
      console.log('Admin accounts already exist; startup will not modify credentials');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Start server with database initialization
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('Admin login: http://localhost:3000/admin/login');
  });
};

if (require.main === module) {
  startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;

