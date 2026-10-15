const express = require('express');
const {
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/')
  .get(getSubscriptionPlans);

router.route('/:id')
  .get(getSubscriptionPlan);

// Protected routes (admin only)
router.use(protect, authorize('admin'));

router.route('/')
  .post(createSubscriptionPlan);

router.route('/:id')
  .put(updateSubscriptionPlan)
  .delete(deleteSubscriptionPlan);

module.exports = router;
