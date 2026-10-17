const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  let query = {};
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Build query
  if (reqQuery.status) {
    query.status = reqQuery.status;
  } else {
    query.status = 'published'; // Default to published posts
  }
  
  if (reqQuery.featured !== undefined) {
    query.featured = reqQuery.featured === 'true';
  }
  if (reqQuery.category) {
    query.category = reqQuery.category;
  }

  // Search functionality
  if (req.query.search) {
    const searchTerm = req.query.search;
    query[Post.sequelize.Op.or] = [
      { title: { [Post.sequelize.Op.iLike]: `%${searchTerm}%` } },
      { excerpt: { [Post.sequelize.Op.iLike]: `%${searchTerm}%` } },
      { content: { [Post.sequelize.Op.iLike]: `%${searchTerm}%` } },
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const offset = (page - 1) * limit;

  // Sort
  let order = [['createdAt', 'DESC']];
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'votes':
        order = [[Post.sequelize.literal('(votes_up - votes_down)'), 'DESC']];
        break;
      case 'popular':
        order = [['votesUp', 'DESC'], ['viewCount', 'DESC']];
        break;
      case 'recent':
        order = [['publishedAt', 'DESC']];
        break;
      case 'comments':
        order = [['commentCount', 'DESC']];
        break;
      default:
        const sortField = req.query.sort.replace('-', '');
        const sortOrder = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
        order = [[sortField, sortOrder]];
    }
  }

  // Execute query
  const { count, rows: posts } = await Post.findAndCountAll({
    where: query,
    order,
    limit,
    offset,
    attributes: {
      include: [
        [Post.sequelize.literal('(votes_up - votes_down)'), 'netVotes'],
      ],
    },
  });

  // Pagination result
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
    count: posts.length,
    total: count,
    pagination,
    data: posts,
  });
});

// @desc    Get single post
// @route   GET /api/v1/posts/:slug
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findOne({
    where: { slug: req.params.slug },
    include: [
      {
        model: Comment,
        as: 'comments',
        where: { status: 'published' },
        required: false,
        order: [['createdAt', 'ASC']],
      },
    ],
    attributes: {
      include: [
        [Post.sequelize.literal('(votes_up - votes_down)'), 'netVotes'],
      ],
    },
  });

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with slug of ${req.params.slug}`, 404)
    );
  }

  // Increment view count
  await post.incrementViews();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Get top posts
// @route   GET /api/v1/posts/top
// @access  Public
exports.getTopPosts = asyncHandler(async (req, res, next) => {
  const period = req.query.period || 'week';
  const limit = parseInt(req.query.limit, 10) || 10;

  let dateFilter = {};
  if (period === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    dateFilter.publishedAt = { [Post.sequelize.Op.gte]: weekAgo };
  } else if (period === 'month') {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    dateFilter.publishedAt = { [Post.sequelize.Op.gte]: monthAgo };
  }

  const posts = await Post.findAll({
    where: {
      status: 'published',
      ...dateFilter,
    },
    order: [
      [Post.sequelize.literal('(votes_up - votes_down)'), 'DESC'],
      ['viewCount', 'DESC'],
    ],
    limit,
    attributes: {
      include: [
        [Post.sequelize.literal('(votes_up - votes_down)'), 'netVotes'],
      ],
    },
  });

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Private/Admin
exports.createPost = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse('Validation failed', 400, errors.array()));
  }

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post,
  });
});

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private/Admin
exports.updatePost = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse('Validation failed', 400, errors.array()));
  }

  let post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  post = await post.update(req.body);

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private/Admin
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  await post.destroy();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Vote on post
// @route   POST /api/v1/posts/:id/vote
// @access  Public
exports.voteOnPost = asyncHandler(async (req, res, next) => {
  const { type } = req.body; // 'like' or 'dislike'

  if (!type || !['like', 'dislike'].includes(type)) {
    return next(new ErrorResponse('Vote type must be "like" or "dislike"', 400));
  }

  const post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Get IP address and visitor ID
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const ipHash = Vote.generateIpHash(ip);
  const visitorId = req.body.visitorId || Vote.generateVisitorId();

  // Rate limiting check
  const canVote = await Vote.checkRateLimit(ipHash);
  if (!canVote) {
    return next(new ErrorResponse('Too many votes from this IP. Please try again later.', 429));
  }

  // Toggle vote
  const result = await Vote.toggleVote(req.params.id, ipHash, visitorId, type);

  // Get updated post with vote counts
  const updatedPost = await Post.findByPk(req.params.id, {
    attributes: {
      include: [
        [Post.sequelize.literal('(votes_up - votes_down)'), 'netVotes'],
      ],
    },
  });

  res.status(200).json({
    success: true,
    action: result.action,
    data: {
      post: updatedPost,
      visitorId,
    },
  });
});

// @desc    Add comment to post
// @route   POST /api/v1/posts/:id/comments
// @access  Public
exports.addComment = asyncHandler(async (req, res, next) => {
  const { body, authorName, authorEmail } = req.body;

  if (!body || !authorName) {
    return next(new ErrorResponse('Comment body and author name are required', 400));
  }

  const post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Get IP address
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const ipHash = Comment.generateIpHash(ip);

  // Rate limiting check
  const canComment = await Comment.checkRateLimit(ipHash);
  if (!canComment) {
    return next(new ErrorResponse('Too many comments from this IP. Please try again later.', 429));
  }

  const comment = await Comment.create({
    postId: req.params.id,
    body,
    authorName,
    authorEmail,
    ipHash,
  });

  res.status(201).json({
    success: true,
    data: comment,
  });
});

// @desc    Get comments for post
// @route   GET /api/v1/posts/:id/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const offset = (page - 1) * limit;

  const { count, rows: comments } = await Comment.findAndCountAll({
    where: {
      postId: req.params.id,
      status: 'published',
    },
    order: [['createdAt', 'ASC']],
    limit,
    offset,
  });

  // Pagination result
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
    count: comments.length,
    total: count,
    pagination,
    data: comments,
  });
});

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private/Admin
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findByPk(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  await comment.destroy();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Moderate comment
// @route   PUT /api/v1/comments/:id/moderate
// @access  Private/Admin
exports.moderateComment = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status || !['published', 'pending', 'deleted'].includes(status)) {
    return next(new ErrorResponse('Status must be "published", "pending", or "deleted"', 400));
  }

  const comment = await Comment.findByPk(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  await comment.moderate(status);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc    Update comment
// @route   PUT /api/v1/comments/:id
// @access  Private/Admin
exports.updateComment = asyncHandler(async (req, res, next) => {
  const { content, status } = req.body;
  
  const comment = await Comment.findByPk(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Update fields
  if (content) comment.content = content;
  if (status) comment.status = status;

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment,
  });
});
