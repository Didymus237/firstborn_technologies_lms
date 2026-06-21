import express from 'express';
import { protect, authorize, optionalProtect } from '../middleware/auth';
import {
  addComment,
  getComments,
  getAllCommentsAdmin,
  deleteComment,
  toggleCommentApproval
} from '../controllers/comment';

const router = express.Router();

// Public routes
router.get('/:id', getComments); // Fetch comments for a specific post
router.post('/:id', optionalProtect, addComment);

// Admin-only management
router.use(protect);
router.use(authorize(['admin']));

router.get('/admin/all', getAllCommentsAdmin);
router.delete('/:id', deleteComment);
router.patch('/:id/approve', toggleCommentApproval);

export default router;
