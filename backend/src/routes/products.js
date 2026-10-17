const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorize } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/categories', productController.getProductCategories);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/search', productController.searchProducts);
router.get('/stats', productController.getProductStats);

// Protected routes (require admin authentication)
router.use(authenticateJWT, authorize('admin'));

// Product CRUD operations
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Bulk operations
router.put('/bulk/update', productController.bulkUpdateProducts);
router.delete('/bulk/delete', productController.bulkDeleteProducts);

module.exports = router;
