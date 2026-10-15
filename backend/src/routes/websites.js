const express = require('express');
const {
  getWebsites,
  getWebsite,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  getWebsitesByTier,
  getTopHits,
  trackHit,
  bulkUploadWebsites,
  getWebsiteStats,
  searchWebsites,
} = require('../controllers/websiteController');

// Include other middlewares
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router({ mergeParams: true });

// Rate limiting for hit tracking
const hitTrackingLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many hit tracking requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for search
const searchLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: 'Too many search requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router
  .route('/')
  .get(getWebsites)
  .post(protect, authorize('admin'), createWebsite);

router.route('/search').get(searchLimit, searchWebsites);

router.route('/tier/:tier').get(getWebsitesByTier);

router.route('/stats').get(protect, authorize('admin'), getWebsiteStats);

router.route('/bulk-upload').post(
  protect,
  authorize('admin'),
  bulkUploadWebsites
);

// Add missing /top route for trending functionality
router.route('/top').get(getTopHits);

router.route('/:id/hit').post(hitTrackingLimit, trackHit);

router
  .route('/:id')
  .get(getWebsite)
  .put(protect, authorize('admin'), updateWebsite)
  .delete(protect, authorize('admin'), deleteWebsite);

module.exports = router;
