import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/AuthProvider';
import type { BlogComment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, User, Send, Calendar, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  });

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/comments/${postId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    try {
      setSubmitting(true);
      await api.post(`/comments/${postId}`, {
        ...formData,
        parentCommentId: parentId
      });
      toast.success(parentId ? 'Reply posted' : 'Comment posted');
      setFormData(prev => ({ ...prev, content: '' }));
      setReplyingTo(null);
      fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Group comments into threads
  const mainComments = comments.filter(c => !c.parentComment);
  const getReplies = (parentId: string) => comments.filter(c => c.parentComment === parentId);

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <MessageSquare className="w-6 h-6 text-[#8B1E1E]" />
        Comments ({comments.length})
      </div>

      {/* Main Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h4 className="text-lg font-semibold mb-4">Leave a comment</h4>
        <CommentForm 
            user={user} 
            formData={formData} 
            setFormData={setFormData}
            submitting={submitting}
            onSubmit={(e) => handleSubmit(e)}
        />
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-lg" />)
        ) : mainComments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          mainComments.map((comment) => (
            <div key={comment._id} className="space-y-4">
              <CommentItem 
                comment={comment} 
                isReply={false}
                onReply={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              />
              
              {/* Nested Replies */}
              <div className="ml-12 space-y-4 border-l-2 border-gray-100 pl-6">
                {getReplies(comment._id).map(reply => (
                    <CommentItem key={reply._id} comment={reply} isReply={true} />
                ))}

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#8B1E1E] uppercase tracking-wider">Replying to {comment.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 text-[10px]">Cancel</Button>
                    </div>
                    <CommentForm 
                        user={user} 
                        formData={formData} 
                        setFormData={setFormData}
                        submitting={submitting}
                        compact
                        onSubmit={(e) => handleSubmit(e, comment._id)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, isReply, onReply }: { comment: BlogComment, isReply: boolean, onReply?: () => void }) => (
    <div className={cn("flex gap-4 p-4 rounded-xl transition-colors hover:bg-gray-50", isReply && "p-3")}>
        <div className="flex-shrink-0">
        <div className={cn("rounded-full bg-[#8B1E1E]/10 flex items-center justify-center", isReply ? "w-8 h-8" : "w-10 h-10")}>
            {comment.user?.photoUrl ? (
            <img src={comment.user.photoUrl} alt={comment.name} className="w-full h-full rounded-full object-cover" />
            ) : (
            <User className={cn("text-[#8B1E1E]", isReply ? "w-4 h-4" : "w-5 h-5")} />
            )}
        </div>
        </div>
        <div className="flex-grow space-y-1">
        <div className="flex items-center justify-between">
            <div>
                <span className="font-bold text-gray-900 line-clamp-1">{comment.name}</span>
                {isReply && <span className="text-[10px] text-gray-400">Replied</span>}
            </div>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
        </p>
        {!isReply && onReply && (
            <button 
                onClick={onReply}
                className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-wider mt-2 flex items-center gap-1 hover:underline"
            >
                <Reply className="w-3 h-3" /> Reply
            </button>
        )}
        </div>
    </div>
);

const CommentForm = ({ user, formData, setFormData, submitting, onSubmit, compact }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
        {!user && (
        <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
            <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Name</label>
            <Input 
                placeholder="Optional" 
                value={formData.name}
                className="h-8 text-sm"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            </div>
            <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Email</label>
            <Input 
                type="email"
                placeholder="Optional" 
                value={formData.email}
                className="h-8 text-sm"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            </div>
        </div>
        )}
        <div className="space-y-1">
        {!compact && <label className="text-sm font-medium text-gray-700">Comment</label>}
        <Textarea 
            placeholder={compact ? "Write your reply..." : "What are your thoughts?"} 
            rows={compact ? 2 : 4}
            value={formData.content}
            className="text-sm"
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            required
        />
        </div>
        <Button 
        type="submit" 
        disabled={submitting}
        size={compact ? "sm" : "default"}
        className="bg-[#8B1E1E] hover:bg-[#701818] text-white flex items-center gap-2"
        >
        {submitting ? 'Posting...' : <><Send className="w-4 h-4" /> {compact ? 'Post Reply' : 'Post Comment'}</>}
        </Button>
    </form>
);
