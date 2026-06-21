import { type Request, type Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import BlogPost from '../models/blogPost';

// Helper to generate slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
};

// Helper to extract excerpt
const extractExcerpt = (content: string, length = 180) => {
  const stripped = content.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
  if (stripped.length <= length) return stripped.trim();
  return stripped.substring(0, length).trim() + '...';
};

// @desc    Create a new blog post
// @route   POST /api/blog
// @access  Private (Admin)
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, isPublished, category, tags, excerpt, authorName } = req.body;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/blog/${req.file.filename}`;
    }

    const slug = slugify(title) + '-' + Math.random().toString(36).substring(2, 7);
    const finalExcerpt = excerpt || extractExcerpt(content);

    const post = await BlogPost.create({
      title,
      content,
      author: req.user!._id,
      authorName: authorName || (req.user as any).name || 'Admin',
      imageUrl,
      isPublished: isPublished !== undefined ? isPublished : true,
      slug,
      excerpt: finalExcerpt,
      category,
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags) : [],
    });

    res.status(201).json(post);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all blog posts
// @route   GET /api/blog
// @access  Public
export const getPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const posts = await BlogPost.find({ isPublished: true })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all blog posts (Admin View - includes unpublished)
// @route   GET /api/blog/admin
// @access  Private (Admin)
export const getAdminPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const posts = await BlogPost.find({})
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get a single blog post by slug
// @route   GET /api/blog/s/:slug
// @access  Public
export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.isPublished && (req as any).user?.role !== 'admin') {
      return res.status(403).json({ message: 'Post is not published' });
    }

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get a single blog post by ID
// @route   GET /api/blog/:id
// @access  Public
export const getPostById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.isPublished && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Post is not published' });
    }

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update a blog post
// @route   PUT /api/blog/:id
// @access  Private (Admin)
export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, isPublished, category, tags, excerpt, authorName } = req.body;

    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (title) {
      post.title = title;
      // Do not auto-update slug on title change to avoid breaking old links, 
      // but maybe provide a way to manual update if needed.
    }
    if (content) {
      post.content = content;
      if (!excerpt) post.excerpt = extractExcerpt(content);
    }
    if (excerpt) post.excerpt = excerpt;
    if (category) post.category = category;
    if (authorName) post.authorName = authorName;
    if (tags) post.tags = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags;
    if (isPublished !== undefined) post.isPublished = isPublished;

    if (req.file) {
      post.imageUrl = `/uploads/blog/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      post.imageUrl = req.body.imageUrl;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blog/:id
// @access  Private (Admin)
export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
