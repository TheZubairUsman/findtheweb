const { validationResult } = require('express-validator');
const models = require('../models');
const { Admin, BlogPost } = models;
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const fs = require('fs');
const path = require('path');

// Data file paths for JSON-based data (fallback)
const dataDir = path.join(__dirname, '../../data');
const websitesFile = path.join(dataDir, 'websites.json');
const postsFile = path.join(dataDir, 'posts.json');

// Helper functions for JSON data
const readData = (filename) => {
  try {
    if (fs.existsSync(filename)) {
      const data = fs.readFileSync(filename, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    
    // For now, use JSON files as primary source since database models may not be properly set up
    const websites = readData(websitesFile);
    const posts = readData(postsFile);
    
    // Try to get blog posts from database if available
    let blogPosts = [];
    try {
      if (BlogPost && typeof BlogPost.findAll === 'function') {
        blogPosts = await BlogPost.findAll({
          order: [['createdAt', 'DESC']],
          limit: 10
        });
      }
    } catch (error) {
      console.log('BlogPost model not available:', error.message);
    }
    
    console.log('📊 Dashboard Data:', {
      websitesCount: websites.length,
      postsCount: posts.length,
      blogPostsCount: blogPosts.length,
      source: 'json_files'
    });

    // Calculate date filter for period
    const now = new Date();
    let startDate = new Date();
    
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
      case 'all':
        startDate = new Date('2020-01-01');
        break;
      default: // 'week'
        startDate.setDate(now.getDate() - 7);
    }

    // Filter recent items by period
    const recentWebsites = websites
      .filter(site => {
        if (!site.createdAt) return false;
        const siteDate = new Date(site.createdAt);
        return siteDate >= startDate;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentPosts = posts
      .filter(post => {
        if (!post.createdAt) return false;
        const postDate = new Date(post.createdAt);
        return postDate >= startDate;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Count websites by tier
    const websitesByTier = {
      standard: websites.filter(w => w.tier === 'standard').length,
      premium: websites.filter(w => w.tier === 'premium').length,
      enterprise: websites.filter(w => w.tier === 'enterprise').length
    };

    // Response data structure
    const responseData = {
      totalWebsites: websites.length,
      totalPosts: posts.length + blogPosts.length,
      websitesByTier,
      recentWebsites: recentWebsites.map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        tier: site.tier,
        createdAt: site.createdAt
      })),
      recentPosts: [
        ...recentPosts.map(post => ({
          id: post.id,
          title: post.title,
          status: post.status || 'published',
          createdAt: post.createdAt
        })),
        ...blogPosts.slice(0, 5 - recentPosts.length).map(post => ({
          id: post.id,
          title: post.title,
          status: post.status,
          createdAt: post.createdAt
        }))
      ].slice(0, 5),
      stats: {
        current: {
          totalWebsites: websites.length,
          totalPosts: posts.length + blogPosts.length,
          websitesByTier
        },
        previous: {
          totalWebsites: 0,
          totalPosts: 0,
          websitesByTier: {
            standard: 0,
            premium: 0,
            enterprise: 0
          }
        }
      }
    };

    console.log('📊 Response Data:', {
      totalWebsites: responseData.totalWebsites,
      totalPosts: responseData.totalPosts,
      websitesByTier: responseData.websitesByTier
    });

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get detailed statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDetailedStats = asyncHandler(async (req, res, next) => {
  const period = req.query.period || 'week';
  
  try {
    const websites = readData(websitesFile);
    const posts = readData(postsFile);
    
    let blogPostsCount = 0;
    try {
      if (BlogPost && typeof BlogPost.count === 'function') {
        blogPostsCount = await BlogPost.count();
      }
    } catch (error) {
      console.log('BlogPost count error:', error.message);
    }

    const tierCounts = {
      standard: websites.filter(w => w.tier === 'standard').length,
      premium: websites.filter(w => w.tier === 'premium').length,
      enterprise: websites.filter(w => w.tier === 'enterprise').length
    };

    const recentWebsites = websites
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        status: site.status || 'active',
        category: site.category || 'Uncategorized',
        createdAt: site.createdAt
      }));

    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        title: post.title,
        website: post.website || 'Unknown',
        category: post.category || 'Uncategorized',
        status: post.status || 'published',
        createdAt: post.createdAt
      }));

    res.json({
      success: true,
      data: {
        totalWebsites: websites.length,
        totalPosts: posts.length + blogPostsCount,
        websitesByTier: tierCounts,
        recentWebsites,
        recentPosts
      }
    });
  } catch (error) {
    console.error('Error fetching detailed stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed statistics'
    });
  }
});

// @desc    Bulk upload data
// @route   POST /api/v1/admin/upload
// @access  Private/Admin
exports.bulkUploadData = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Please upload a JSON file', 400));
  }

  const file = req.files.file;
  const { type } = req.body;

  if (!type || !['websites', 'posts'].includes(type)) {
    return next(new ErrorResponse('Upload type must be "websites" or "posts"', 400));
  }

  if (!file.name.endsWith('.json')) {
    return next(new ErrorResponse('Please upload a JSON file', 400));
  }

  try {
    const data = JSON.parse(file.data.toString());
    
    if (!Array.isArray(data)) {
      return next(new ErrorResponse('JSON file must contain an array', 400));
    }

    const targetFile = type === 'websites' ? websitesFile : postsFile;
    const existingData = readData(targetFile);
    
    // Add new data with IDs
    const newData = data.map(item => ({
      ...item,
      id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: item.createdAt || new Date().toISOString()
    }));

    const combinedData = [...existingData, ...newData];
    fs.writeFileSync(targetFile, JSON.stringify(combinedData, null, 2));

    res.status(201).json({
      success: true,
      type,
      count: newData.length,
      message: `Successfully uploaded ${newData.length} ${type}`
    });

  } catch (error) {
    return next(new ErrorResponse('Invalid JSON file format', 400));
  }
});

// @desc    Export data
// @route   GET /api/v1/admin/export
// @access  Private/Admin
exports.exportData = asyncHandler(async (req, res, next) => {
  const { type } = req.query;

  if (!type || !['websites', 'posts', 'blog'].includes(type)) {
    return next(new ErrorResponse('Export type must be "websites", "posts", or "blog"', 400));
  }

  let data;
  let filename;

  try {
    switch (type) {
      case 'websites':
        data = readData(websitesFile);
        filename = 'websites_export.json';
        break;
      case 'posts':
        data = readData(postsFile);
        filename = 'posts_export.json';
        break;
      case 'blog':
        try {
          if (BlogPost && typeof BlogPost.findAll === 'function') {
            data = await BlogPost.findAll({
              include: [{
                model: Admin,
                as: 'author',
                attributes: ['id', 'name', 'email']
              }]
            });
          } else {
            data = [];
          }
        } catch (error) {
          data = [];
        }
        filename = 'blog_posts_export.json';
        break;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).json({
      success: true,
      exportDate: new Date().toISOString(),
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Export error:', error);
    return next(new ErrorResponse('Failed to export data', 500));
  }
});

// @desc    Get user management data (simplified for admin-only system)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUserManagement = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    if (Admin && typeof Admin.findAndCountAll === 'function') {
      const { count, rows: admins } = await Admin.findAndCountAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const pagination = {};
      const totalPages = Math.ceil(count / limit);

      if (page < totalPages) {
        pagination.next = { page: page + 1, limit };
      }
      if (page > 1) {
        pagination.prev = { page: page - 1, limit };
      }

      res.status(200).json({
        success: true,
        count: admins.length,
        total: count,
        pagination,
        data: admins,
      });
    } else {
      res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        pagination: {},
        data: [],
      });
    }
  } catch (error) {
    console.error('User management error:', error);
    return next(new ErrorResponse('Failed to fetch user data', 500));
  }
});

// @desc    Get pending comments for moderation (placeholder)
// @route   GET /api/v1/admin/comments/pending
// @access  Private/Admin
exports.getPendingComments = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    count: 0,
    total: 0,
    pagination: {},
    data: [],
  });
});

// @desc    Clean up old data (placeholder)
// @route   POST /api/v1/admin/cleanup
// @access  Private/Admin
exports.cleanupOldData = asyncHandler(async (req, res, next) => {
  const { type, days } = req.body;
  
  res.status(200).json({
    success: true,
    message: `Cleanup operation for ${type} completed`,
    deletedCount: 0,
  });
});