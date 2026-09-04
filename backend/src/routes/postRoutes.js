const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  toggleLike,
  addComment,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public feed (optionalAuth to determine likedByCurrentUser)
router.get('/', optionalAuth, getPosts);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

module.exports = router;
