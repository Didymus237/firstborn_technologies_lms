import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { BlogPost } from '../../types';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/AuthProvider';
import { 
    Edit2, 
    Trash2,
    Calendar, 
    User as UserIcon, 
    ArrowRight, 
    MessageSquare,
    Bookmark,
    Share2,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const BlogSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const res = await api.get('/blog');
                setPosts(res.data.slice(0, 3)); // Only show latest 3
            } catch (error) {
                console.error('Failed to load blog posts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-[#8B1E1E]">
                    <div className="w-1 h-8 bg-[#C5A03A] rounded-full" />
                    <h3 className="text-2xl font-bold">Community Updates</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="overflow-hidden border-none shadow-lg">
                            <Skeleton className="h-48 w-full" />
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-6 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8B1E1E]">
                    <div className="w-1 h-8 bg-[#C5A03A] rounded-full" />
                    <h3 className="text-2xl font-bold">Community Updates</h3>
                </div>
                <Button variant="ghost" className="text-[#8B1E1E] hover:text-[#701818] font-bold gap-2">
                    View All Posts <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {posts.map((post) => {
                    const getImageUrl = (path: string) => {
                        if (!path) return '';
                        if (path.startsWith('http') || path.startsWith('data:')) return path;
                        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
                        const host = apiBase.split('/api')[0];
                        return `${host}${path}`;
                    };

                    return (
                        <Card key={post._id} className="group overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white flex flex-col">
                            <div className="relative h-48 overflow-hidden">
                                <Link to={`/blog/${post.slug}`}>
                                    {post.imageUrl ? (
                                        <img 
                                            src={getImageUrl(post.imageUrl)} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#8B1E1E]/5 to-[#C5A03A]/5 flex items-center justify-center">
                                            <MessageSquare className="w-12 h-12 text-[#8B1E1E]/20" />
                                        </div>
                                    )}
                                </Link>
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-[#8B1E1E] text-white border-none font-bold uppercase tracking-tighter text-[9px]">Latest Update</Badge>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/40">
                                            <Bookmark className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/40">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {user?.role === 'admin' && (
                                        <div className="flex gap-2">
                                            <Button 
                                                size="icon" 
                                                variant="secondary" 
                                                className="h-8 w-8 rounded-full bg-blue-500/80 backdrop-blur-md border-blue-400/20 text-white hover:bg-blue-600"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    navigate('/cms/blog');
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                size="icon" 
                                                variant="secondary" 
                                                className="h-8 w-8 rounded-full bg-red-500/80 backdrop-blur-md border-red-400/20 text-white hover:bg-red-600"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (window.confirm('Delete this post?')) {
                                                        try {
                                                            await api.delete(`/blog/${post._id}`);
                                                            toast.success('Deleted');
                                                            setPosts(prev => prev.filter(p => p._id !== post._id));
                                                        } catch (err: any) {
                                                            toast.error(err.response?.data?.message || 'Delete failed');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <CardHeader className="space-y-2 p-5 pb-2">
                                <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-[#C5A03A]" />
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-[#C5A03A]" />
                                        5 min read
                                    </span>
                                </div>
                                <Link to={`/blog/${post.slug}`}>
                                    <h4 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>
                                </Link>
                            </CardHeader>

                            <CardContent className="p-5 pt-0 flex-grow">
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                    {post.excerpt || post.content.substring(0, 150) + '...'}
                                </p>
                            </CardContent>

                            <CardFooter className="p-5 pt-0 flex justify-between items-center border-t border-gray-50 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#8B1E1E]/10 flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-[#8B1E1E]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-800">{post.authorName || 'Admin'}</span>
                                        {post.category && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{post.category}</span>}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[#8B1E1E] font-bold hover:bg-[#8B1E1E]/5 p-0" asChild>
                                    <Link to={`/blog/${post.slug}`}>
                                        Read More
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
};
