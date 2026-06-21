import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createPost,
  getPosts,
  getAdminPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
} from '../controllers/blogPost';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/s/:slug', getPostBySlug);
router.get('/:id', getPostById);

// Protected routes (Admin only for management)
router.use(protect);
router.get('/admin/all', authorize(['admin']), getAdminPosts);
router.post('/', authorize(['admin']), upload.single('image'), createPost);
router.put('/:id', authorize(['admin']), upload.single('image'), updatePost);
router.delete('/:id', authorize(['admin']), deletePost);

export default router;
