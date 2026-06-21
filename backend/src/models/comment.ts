import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  blogPost: mongoose.Schema.Types.ObjectId;
  user?: mongoose.Schema.Types.ObjectId;
  parentComment?: mongoose.Schema.Types.ObjectId | null;
  name: string;
  email: string;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema({
  blogPost: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if guest
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // NEW: Support for replies
  name: { type: String, default: 'Guest' },
  email: { type: String, default: '' },
  content: { type: String, required: true },
  isApproved: { type: Boolean, default: true }, // Set to true by default for now, can be changed for moderation
}, {
  timestamps: true
});

// Index for faster lookups per post
CommentSchema.index({ blogPost: 1, isApproved: 1, createdAt: -1 });

const Comment = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
