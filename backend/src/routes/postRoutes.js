import express from 'express';
import {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
  updateComment,
  deleteComment,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Feed route (works for guests and logged-in users)
router.get('/', optionalAuth, getPosts);

// Post actions
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);

// Comment actions
router.post('/:id/comment', protect, addComment);
router.put('/:postId/comments/:commentId', protect, updateComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

export default router;
