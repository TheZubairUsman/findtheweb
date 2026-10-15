const { Op } = require('sequelize');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get all subscription plans
 * @route   GET /api/v1/subscription-plans
 * @access  Public
 */
const getSubscriptionPlans = async (req, res, next) => {
  try {
    const { active } = req.query;
    const whereClause = {};

    if (active === 'true') {
      whereClause.isActive = true;
    }

    const plans = await SubscriptionPlan.findAll({
      where: whereClause,
      order: [['order', 'ASC'], ['createdAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    logger.error(`Get subscription plans error: ${error.message}`);
    next(new ErrorResponse('Failed to get subscription plans', 500));
  }
};

/**
 * @desc    Get single subscription plan
 * @route   GET /api/v1/subscription-plans/:id
 * @access  Public
 */
const getSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);

    if (!plan) {
      return next(
        new ErrorResponse(`Subscription plan not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error(`Get subscription plan error: ${error.message}`);
    next(new ErrorResponse('Failed to get subscription plan', 500));
  }
};

/**
 * @desc    Create new subscription plan
 * @route   POST /api/v1/subscription-plans
 * @access  Private/Admin
 */
const createSubscriptionPlan = async (req, res, next) => {
  try {
    // Only admins can create subscription plans
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse('Not authorized to create subscription plans', 403)
      );
    }

    const plan = await SubscriptionPlan.create(req.body);

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error(`Create subscription plan error: ${error.message}`);
    next(new ErrorResponse('Failed to create subscription plan', 500));
  }
};

/**
 * @desc    Update subscription plan
 * @route   PUT /api/v1/subscription-plans/:id
 * @access  Private/Admin
 */
const updateSubscriptionPlan = async (req, res, next) => {
  try {
    // Only admins can update subscription plans
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse('Not authorized to update subscription plans', 403)
      );
    }

    let plan = await SubscriptionPlan.findByPk(req.params.id);

    if (!plan) {
      return next(
        new ErrorResponse(`Subscription plan not found with id of ${req.params.id}`, 404)
      );
    }

    plan = await plan.update(req.body);

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error(`Update subscription plan error: ${error.message}`);
    next(new ErrorResponse('Failed to update subscription plan', 500));
  }
};

/**
 * @desc    Delete subscription plan
 * @route   DELETE /api/v1/subscription-plans/:id
 * @access  Private/Admin
 */
const deleteSubscriptionPlan = async (req, res, next) => {
  try {
    // Only admins can delete subscription plans
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse('Not authorized to delete subscription plans', 403)
      );
    }

    const plan = await SubscriptionPlan.findByPk(req.params.id);

    if (!plan) {
      return next(
        new ErrorResponse(`Subscription plan not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if there are any active subscriptions using this plan
    const activeSubscriptions = await plan.countListings({
      where: {
        subscriptionStatus: 'active',
      },
    });

    if (activeSubscriptions > 0) {
      return next(
        new ErrorResponse(
          'Cannot delete subscription plan with active subscriptions',
          400
        )
      );
    }

    await plan.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    logger.error(`Delete subscription plan error: ${error.message}`);
    next(new ErrorResponse('Failed to delete subscription plan', 500));
  }
};

module.exports = {
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
};
