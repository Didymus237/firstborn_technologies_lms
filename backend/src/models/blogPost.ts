import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  imageUrl?: string;
  isPublished: boolean;
  slug: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema: Schema<IBlogPost> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    imageUrl: { type: String },
    isPublished: { type: Boolean, default: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    category: { type: String },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
