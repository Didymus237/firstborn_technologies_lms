import { type Request, type Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import Comment from '../models/comment';
import BlogPost from '../models/blogPost';

// @desc    Add a comment to a blog post
// @route   POST /api/blog/:id/comments
// @access  Public
export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, content, parentCommentId } = req.body;
    const blogPost = await BlogPost.findById(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const commentData: any = {
      blogPost: blogPost._id,
      content,
      isApproved: true, // Default to true
      parentComment: parentCommentId || null
    };

    if (req.user) {
      commentData.user = req.user._id;
      commentData.name = (req.user as any).name || 'Authenticated User';
      commentData.email = req.user.email;
    } else {
      commentData.name = name || 'Guest';
      commentData.email = email || 'guest@firstborn-technologies.com';
    }

    const comment = await Comment.create(commentData);
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get comments for a blog post
// @route   GET /api/blog/:id/comments
// @access  Public
export const getComments = async (req: Request, res: Response) => {
  try {
    const blogId = req.params.id;
    const comments = await Comment.find({ 
      blogPost: blogId as any, 
      isApproved: true 
    })
    .populate('user', 'name photoUrl')
    .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all comments for admin
// @route   GET /api/blog/admin/comments
// @access  Private (Admin)
export const getAllCommentsAdmin = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({})
      .populate('blogPost', 'title slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/blog/comments/:id
// @access  Private (Admin)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Toggle comment approval
// @route   PATCH /api/blog/comments/:id/approve
// @access  Private (Admin)
export const toggleCommentApproval = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.isApproved = !comment.isApproved;
    await comment.save();
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
