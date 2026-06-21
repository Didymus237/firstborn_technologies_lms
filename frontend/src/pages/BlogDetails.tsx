import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { api } from '@/lib/api';
import type { BlogPost } from '../types';
import { 
  Calendar, 
  User as UserIcon, 
  ArrowLeft, 
  Tag, 
  Share2, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSection } from '@/components/blog/CommentSection';
import { toast } from 'sonner';

// Helper to get full image URL
export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const host = apiBase.split('/api')[0];
    return `${host}${path}`;
};

export const BlogDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/blog/s/${slug}`);
                setPost(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Blog post not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPost();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-3/4" />
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (!post) return null;


    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-gray-50/50 border-b">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="text-sm font-medium text-gray-500 hover:text-[#8B1E1E] flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <span>Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>Blog</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-gray-600">Article</span>
                    </div>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-6 pt-12">
                {/* Meta Header */}
                <div className="space-y-6 mb-10">
                    {post.category && (
                        <span className="bg-[#8B1E1E]/5 text-[#8B1E1E] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-[#8B1E1E]/10">
                            {post.category}
                        </span>
                    )}
                    
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0D1B2A] leading-tight tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#8B1E1E]/5 flex items-center justify-center border border-[#8B1E1E]/10">
                                <UserIcon className="w-5 h-5 text-[#8B1E1E]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{post.authorName || 'Firstborn Admin'}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Author</p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                        <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">5 min read</span>
                        </div>

                        <div className="ml-auto flex gap-2">
                             <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200 hover:text-[#8B1E1E] hover:border-[#8B1E1E]/30 transition-all">
                                <Share2 className="w-4 h-4" />
                             </Button>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                {post.imageUrl && (
                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-gray-200">
                        <img 
                            src={getImageUrl(post.imageUrl)} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-serif">
                    <div className="whitespace-pre-wrap">
                        {post.content}
                    </div>
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-100 flex items-start gap-3">
                        <Tag className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="bg-gray-50 text-gray-600 text-[11px] font-bold px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer capitalize">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comment Section */}
                {post._id && <CommentSection postId={post._id} />}

                {/* Next/Prev or Related (Mockup) */}
                <div className="mt-20 p-8 rounded-3xl bg-[#0D1B2A] text-white flex flex-col items-center text-center gap-6">
                    <h3 className="text-2xl font-bold">Stay Updated with Our Community</h3>
                    <p className="text-gray-400 max-w-lg">Join our newsletter to receive the latest updates, event news, and expert educational insights directly in your inbox.</p>
                    <div className="flex w-full max-w-md gap-2">
                        <input className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[#8B1E1E]/50 transition-all" placeholder="Enter your email" />
                        <Button className="bg-[#8B1E1E] hover:bg-[#701818] font-bold rounded-xl px-6">Subscribe</Button>
                    </div>
                </div>
            </article>
        </div>
    );
};
