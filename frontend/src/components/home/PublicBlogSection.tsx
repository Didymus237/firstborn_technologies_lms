import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { BlogPost } from '../../types';
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export default function PublicBlogSection() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const res = await api.get('/blog');
                setPosts(res.data.slice(0, 3));
            } catch (error) {
                console.error('Failed to load blog posts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (!loading && posts.length === 0) return null;

    return (
        <section className="py-24 bg-white dark:bg-[#121212]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-[#8B1E1E] font-bold tracking-widest uppercase text-sm border-l-4 border-[#C5A03A] pl-4 mb-6">
                            Latest from Our Blog
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                            Insights, Updates & Innovation Hub
                        </h3>
                    </div>
                    <Button variant="outline" className="border-[#8B1E1E] text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-white px-8 py-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105" asChild>
                        <Link to="/blog">
                            Browse All Insights <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="space-y-6">
                                <Skeleton className="h-64 w-full rounded-3xl" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>
                        ))
                    ) : (
                        posts.map((post) => {
                            const date = new Date(post.createdAt);
                            const day = date.getDate();
                            const month = date.toLocaleString('default', { month: 'short' });

                            const getImageUrl = (path: string) => {
                                if (!path) return '';
                                if (path.startsWith('http') || path.startsWith('data:')) return path;
                                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
                                const host = apiBase.split('/api')[0];
                                return `${host}${path}`;
                            };

                            return (
                                <article key={post._id} className="group flex flex-col bg-white dark:bg-[#1c1c1c] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                    <div className="relative h-64 overflow-hidden">
                                        <Link to={`/blog/${post.slug}`}>
                                            {post.imageUrl ? (
                                                <img 
                                                    src={getImageUrl(post.imageUrl)} 
                                                    alt={post.title} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#8B1E1E]/5 to-[#C5A03A]/5 flex items-center justify-center">
                                                    <MessageSquare className="w-16 h-16 text-[#8B1E1E]/10" />
                                                </div>
                                            )}
                                        </Link>
                                        {/* Date Badge */}
                                        <div className="absolute top-0 right-0 bg-[#8B1E1E] text-white p-4 flex flex-col items-center justify-center min-w-[70px] border-bl-2xl border-b border-l border-[#C5A03A]/30">
                                            <span className="text-2xl font-black leading-none">{day}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{month}</span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow">
                                        <Link to={`/blog/${post.slug}`}>
                                            <h4 className="text-[#C5A03A] font-black text-xl uppercase tracking-tight mb-4 group-hover:text-[#8B1E1E] transition-colors line-clamp-2 leading-tight">
                                                {post.title}
                                            </h4>
                                        </Link>
                                        
                                        <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 mb-6 group-hover:w-24 group-hover:bg-[#C5A03A] transition-all duration-500"></div>

                                        <p className="text-gray-600 dark:text-gray-400 text-base line-clamp-3 mb-8 leading-relaxed">
                                            {post.excerpt || post.content.substring(0, 160) + '...'}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between">
                                            <Link to={`/blog/${post.slug}`} className="inline-flex items-center text-[#8B1E1E] font-bold text-sm uppercase tracking-widest hover:text-[#C5A03A] transition-colors">
                                                Read Fully <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                                            </Link>
                                            {post.category && (
                                                <div className="text-[10px] font-bold text-[#8B1E1E] bg-[#8B1E1E]/5 px-2 py-1 rounded uppercase tracking-[0.2em] border border-[#8B1E1E]/10">
                                                    {post.category}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
