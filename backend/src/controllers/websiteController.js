const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// Data storage paths
const dataDir = path.join(__dirname, '../../data');
const websitesFile = path.join(dataDir, 'websites.json');
const categoriesFile = path.join(dataDir, 'categories.json');

// Helper functions for JSON file operations
const readData = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading data file:', error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

// @desc    Get all websites
// @route   GET /api/v1/websites
// @access  Public
exports.getWebsites = async (req, res, next) => {
  try {
    const websites = readData(websitesFile);
    const categories = readData(categoriesFile);
    
    let filteredWebsites = [...websites];
    
    // Apply filters
    if (req.query.tier) {
      filteredWebsites = filteredWebsites.filter(w => w.tier === req.query.tier);
    }
    if (req.query.status) {
      filteredWebsites = filteredWebsites.filter(w => w.status === req.query.status);
    }
    if (req.query.featured !== undefined) {
      const featured = req.query.featured === 'true';
      filteredWebsites = filteredWebsites.filter(w => w.featured === featured);
    }
    if (req.query.categoryId) {
      filteredWebsites = filteredWebsites.filter(w => w.categoryId == req.query.categoryId);
    }
    
    // Search functionality
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredWebsites = filteredWebsites.filter(w => 
        w.name?.toLowerCase().includes(searchTerm) ||
        w.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    const sortField = req.query.sort?.replace('-', '') || 'createdAt';
    const sortOrder = req.query.sort?.startsWith('-') ? -1 : 1;
    
    filteredWebsites.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        return sortOrder * (new Date(bVal) - new Date(aVal));
      }
      
      if (typeof aVal === 'string') {
        return sortOrder * aVal.localeCompare(bVal);
      }
      
      return sortOrder * (bVal - aVal);
    });
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const total = filteredWebsites.length;
    const paginatedWebsites = filteredWebsites.slice(offset, offset + limit);
    
    // Add category information
    const websitesWithCategories = paginatedWebsites.map(website => {
      const category = categories.find(c => c.id == website.categoryId);
      return {
        ...website,
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null
      };
    });
    
    // Pagination result
    const pagination = {};
    const totalPages = Math.ceil(total / limit);
    
    if (page < totalPages) {
      pagination.next = { page: page + 1, limit };
    }
    if (page > 1) {
      pagination.prev = { page: page - 1, limit };
    }
    
    res.status(200).json({
      success: true,
      count: websitesWithCategories.length,
      total,
      pagination,
      data: websitesWithCategories,
    });
  } catch (error) {
    console.error('Error getting websites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch websites'
    });
  }
};

// @desc    Get websites by tier
// @route   GET /api/v1/websites/tier/:tier
// @access  Public
exports.getWebsitesByTier = async (req, res, next) => {
  try {
    const { tier } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const websites = readData(websitesFile);
    const categories = readData(categoriesFile);
    
    const tierWebsites = websites
      .filter(w => w.tier === tier && w.status === 'active')
      .sort((a, b) => (b.totalHits || 0) - (a.totalHits || 0))
      .slice(0, limit);
    
    // Add category information
    const websitesWithCategories = tierWebsites.map(website => {
      const category = categories.find(c => c.id == website.categoryId);
      return {
        ...website,
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: websitesWithCategories.length,
      data: websitesWithCategories,
    });
  } catch (error) {
    console.error('Error getting websites by tier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch websites by tier'
    });
  }
};

// @desc    Get top hits websites
// @route   GET /api/v1/websites/top
// @access  Public
exports.getTopHits = async (req, res, next) => {
  try {
    const period = req.query.period || 'week';
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const websites = readData(websitesFile);
    const categories = readData(categoriesFile);
    
    // Sort by hits based on period
    const sortField = period === 'week' ? 'weeklyHits' : 'totalHits';
    const topWebsites = websites
      .filter(w => w.status === 'active')
      .sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0))
      .slice(0, limit);
    
    // Add category information
    const websitesWithCategories = topWebsites.map(website => {
      const category = categories.find(c => c.id == website.categoryId);
      return {
        ...website,
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: websitesWithCategories.length,
      data: websitesWithCategories,
    });
  } catch (error) {
    console.error('Error getting top hits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top hits'
    });
  }
};

// @desc    Get single website
// @route   GET /api/v1/websites/:id
// @access  Public
exports.getWebsite = async (req, res, next) => {
  try {
    const websites = readData(websitesFile);
    const categories = readData(categoriesFile);
    
    const website = websites.find(w => w.id == req.params.id);
    
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }
    
    // Add category information
    const category = categories.find(c => c.id == website.categoryId);
    const websiteWithCategory = {
      ...website,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null
    };
    
    res.status(200).json({
      success: true,
      data: websiteWithCategory,
    });
  } catch (error) {
    console.error('Error getting website:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch website'
    });
  }
};

// @desc    Create new website
// @route   POST /api/v1/websites
// @access  Private/Admin
exports.createWebsite = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const websites = readData(websitesFile);
    const newWebsite = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalHits: 0,
      weeklyHits: 0,
      status: req.body.status || 'active'
    };

    websites.push(newWebsite);
    
    if (!writeData(websitesFile, websites)) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save website'
      });
    }

    res.status(201).json({
      success: true,
      data: newWebsite,
    });
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create website'
    });
  }
};

// @desc    Update website
// @route   PUT /api/v1/websites/:id
// @access  Private/Admin
exports.updateWebsite = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const websites = readData(websitesFile);
    const websiteIndex = websites.findIndex(w => w.id == req.params.id);

    if (websiteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Website not found with id of ${req.params.id}`
      });
    }

    const updatedWebsite = {
      ...websites[websiteIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    websites[websiteIndex] = updatedWebsite;
    
    if (!writeData(websitesFile, websites)) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update website'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedWebsite,
    });
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update website'
    });
  }
};

// @desc    Delete website
// @route   DELETE /api/v1/websites/:id
// @access  Private/Admin
exports.deleteWebsite = async (req, res, next) => {
  try {
    const websites = readData(websitesFile);
    const websiteIndex = websites.findIndex(w => w.id == req.params.id);

    if (websiteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Website not found with id of ${req.params.id}`
      });
    }

    websites.splice(websiteIndex, 1);
    
    if (!writeData(websitesFile, websites)) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete website'
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete website'
    });
  }
};

// @desc    Track website hit
// @route   POST /api/v1/websites/:id/hit
// @access  Public
exports.trackHit = async (req, res, next) => {
  try {
    const websites = readData(websitesFile);
    const websiteIndex = websites.findIndex(w => w.id == req.params.id);

    if (websiteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Website not found with id of ${req.params.id}`
      });
    }

    // Simple hit tracking - increment counters
    websites[websiteIndex].totalHits = (websites[websiteIndex].totalHits || 0) + 1;
    websites[websiteIndex].weeklyHits = (websites[websiteIndex].weeklyHits || 0) + 1;
    websites[websiteIndex].updatedAt = new Date().toISOString();
    
    if (!writeData(websitesFile, websites)) {
      return res.status(500).json({
        success: false,
        message: 'Failed to track hit'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hit tracked successfully',
      data: {
        totalHits: websites[websiteIndex].totalHits,
        weeklyHits: websites[websiteIndex].weeklyHits
      }
    });
  } catch (error) {
    console.error('Error tracking hit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track hit'
    });
  }
};

// @desc    Bulk upload websites
// @route   POST /api/v1/websites/bulk-upload
// @access  Private/Admin
exports.bulkUploadWebsites = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Please upload a JSON file', 400));
  }

  const file = req.files.file;

  // Check if file is JSON
  if (!file.name.endsWith('.json')) {
    return next(new ErrorResponse('Please upload a JSON file', 400));
  }

  try {
    const data = JSON.parse(file.data.toString());
    
    if (!Array.isArray(data)) {
      return next(new ErrorResponse('JSON file must contain an array of websites', 400));
    }

    // Validate and process websites
    const websites = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      try {
        // Basic validation
        if (!item.name || !item.url || !item.description) {
          errors.push(`Row ${i + 1}: Missing required fields (name, url, description)`);
          continue;
        }

        // Check if category exists
        let categoryId = item.categoryId;
        if (item.categoryName && !categoryId) {
          const category = await Category.findOne({ where: { name: item.categoryName } });
          categoryId = category ? category.id : null;
        }

        if (!categoryId) {
          errors.push(`Row ${i + 1}: Invalid or missing category`);
          continue;
        }

        websites.push({
          name: item.name,
          url: item.url,
          description: item.description,
          categoryId,
          tier: item.tier || 'standard',
          region: item.region || 'global',
          status: item.status || 'active',
          featured: item.featured || false,
          verified: item.verified || false,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          metadata: item.metadata || {},
        });
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0 && websites.length === 0) {
      return next(new ErrorResponse('No valid websites to import', 400, errors));
    }

    // Bulk create websites
    const createdWebsites = await Website.bulkCreate(websites, {
      validate: true,
      returning: true,
    });

    res.status(201).json({
      success: true,
      count: createdWebsites.length,
      errors: errors.length > 0 ? errors : undefined,
      data: createdWebsites,
    });

  } catch (error) {
    return next(new ErrorResponse('Invalid JSON file format', 400));
  }
});

// @desc    Get website statistics
// @route   GET /api/v1/websites/stats
// @access  Private/Admin
exports.getWebsiteStats = asyncHandler(async (req, res, next) => {
  const stats = await Website.findAll({
    attributes: [
      'tier',
      [Website.sequelize.fn('COUNT', Website.sequelize.col('id')), 'count'],
      [Website.sequelize.fn('SUM', Website.sequelize.col('totalHits')), 'totalHits'],
    ],
    group: ['tier'],
  });

  const totalWebsites = await Website.count();
  const activeWebsites = await Website.count({ where: { status: 'active' } });
  const featuredWebsites = await Website.count({ where: { featured: true } });

  res.status(200).json({
    success: true,
    data: {
      totalWebsites,
      activeWebsites,
      featuredWebsites,
      tierStats: stats,
    },
  });
});

// @desc    Search websites
// @route   GET /api/v1/websites/search
// @access  Public
exports.searchWebsites = asyncHandler(async (req, res, next) => {
  const { q: searchTerm, limit = 10, page = 1 } = req.query;
  
  if (!searchTerm) {
    return next(new ErrorResponse('Search term is required', 400));
  }

  const offset = (page - 1) * limit;

  const { count, rows: websites } = await Website.findAndCountAll({
    where: {
      [Website.sequelize.Op.or]: [
        { name: { [Website.sequelize.Op.iLike]: `%${searchTerm}%` } },
        { description: { [Website.sequelize.Op.iLike]: `%${searchTerm}%` } },
      ],
      status: 'active',
    },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
    order: [['totalHits', 'DESC'], ['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  const pagination = {};
  const totalPages = Math.ceil(count / limit);

  if (page < totalPages) {
    pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
  }
  if (page > 1) {
    pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
  }

  res.status(200).json({
    success: true,
    count: websites.length,
    total: count,
    pagination,
    data: websites,
  });
});
