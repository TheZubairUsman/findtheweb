const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getCategoryBreadcrumbs,
  uploadCategoryImage,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Import file upload middleware
const fileUpload = require('../middleware/fileUpload');

// Re-usable validation rules
const categoryValidation = [
  check('name', 'Name is required').notEmpty().trim(),
  check('description', 'Description is required').notEmpty().trim(),
  check('parentId', 'Parent ID must be a valid UUID').optional().isUUID(),
  check('isActive', 'isActive must be a boolean').optional().isBoolean(),
  check('isFeatured', 'isFeatured must be a boolean').optional().isBoolean(),
  check('sortOrder', 'Sort order must be a number').optional().isInt(),
];

// Public routes
router
  .route('/')
  .get(getCategories)
  .post(
    protect,
    authorize('admin', 'moderator'),
    categoryValidation,
    createCategory
  );

// Category tree (public)
router.get('/tree', getCategoryTree);

// Category image upload
router.put(
  '/:id/image',
  protect,
  authorize('admin', 'moderator'),
  fileUpload.single('image'),
  uploadCategoryImage
);

// Category breadcrumbs (public)
router.get('/:id/breadcrumbs', getCategoryBreadcrumbs);

// Protected routes (require authentication)
router
  .route('/:id')
  .get(getCategory)
  .put(
    protect,
    authorize('admin', 'moderator'),
    categoryValidation,
    updateCategory
  )
  .delete(protect, authorize('admin'), deleteCategory);

// Get category descendants (public)
router.get('/:id/descendants', async (req, res, next) => {
  // This will be handled by the getCategory controller with include=descendants
  req.query.include = 'descendants';
  getCategory(req, res, next);
});

// Get category ancestors (public)
router.get('/:id/ancestors', async (req, res, next) => {
  // This will be handled by the getCategory controller with include=ancestors
  req.query.include = 'ancestors';
  getCategory(req, res, next);
});

// Get category listings (will be implemented in listing routes)
// router.get('/:id/listings', getCategoryListings);

module.exports = router;
