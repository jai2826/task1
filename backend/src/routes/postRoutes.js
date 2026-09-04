import express from 'express';
import {
  getPosts,
  createPost,
  toggleLike,
  addComment,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public feed (optionalAuth to determine likedByCurrentUser)
router.get('/', optionalAuth, getPosts);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

export default router;
