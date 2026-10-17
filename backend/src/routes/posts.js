const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  voteOnPost,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  getTopPosts,
  getFeaturedPosts,
} = require('../controllers/postController');

const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Include other middlewares
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const router = express.Router({ mergeParams: true });

// Rate limiting for voting
const voteLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 votes per windowMs
  message: 'Too many vote requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for comments
const commentLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 comments per windowMs
  message: 'Too many comment requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('author').notEmpty().withMessage('Author is required'),
];

const validateComment = [
  body('body').notEmpty().withMessage('Comment body is required'),
  body('authorName').notEmpty().withMessage('Author name is required'),
  body('authorEmail').isEmail().withMessage('Valid email is required'),
];

// Public routes
router
  .route('/')
  .get(
    advancedResults(Post, [
      {
        model: Comment,
        as: 'comments',
        where: { status: 'approved' },
        required: false,
        limit: 3,
        order: [['createdAt', 'DESC']],
      },
    ]),
    getPosts
  )
  .post(protect, authorize('admin'), validatePost, createPost);

router.route('/top').get(getTopPosts);

router.route('/featured').get(
  advancedResults(Post, [
    {
      model: Comment,
      as: 'comments',
      where: { status: 'approved' },
      required: false,
      limit: 3,
      order: [['createdAt', 'DESC']],
    },
  ]),
  getFeaturedPosts
);

// Post-specific routes
router.route('/:id/vote').post(voteLimit, voteOnPost);

router
  .route('/:id/comments')
  .get(
    advancedResults(Comment, null, {
      where: { status: 'approved' },
      include: [
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title'],
        },
      ],
    }),
    getComments
  )
  .post(commentLimit, validateComment, addComment);

router
  .route('/:postId/comments/:commentId')
  .put(protect, authorize('admin'), updateComment)
  .delete(protect, authorize('admin'), deleteComment);

router
  .route('/:id')
  .get(getPost)
  .put(protect, authorize('admin'), validatePost, updatePost)
  .delete(protect, authorize('admin'), deletePost);

module.exports = router;
