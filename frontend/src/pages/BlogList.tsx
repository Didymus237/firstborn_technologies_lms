import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import type { BlogPost } from '../types';
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, MessageSquare, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { Input } from '@/components/ui/input';

export default function BlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
        const host = apiBase.split('/api')[0];
        return `${host}${path}`;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const res = await api.get('/blog');
                setPosts(res.data);
                setFilteredPosts(res.data);
            } catch (error) {
                console.error('Failed to load blog posts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        let result = posts;
        if (searchTerm) {
            result = result.filter(p => 
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }
        setFilteredPosts(result);
    }, [searchTerm, selectedCategory, posts]);

    const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212]">
            <Navbar />
            
            {/* Page Header */}
            <header className="pt-32 pb-16 bg-linear-to-b from-gray-50 to-white dark:from-[#1c1c1c] dark:to-[#121212]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        Our <span className="text-[#8B1E1E]">Blog</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                        Stay updated with the latest in AI, Global Education, and Innovative Digital Solutions.
                    </p>
                    
                    {/* Search & Filter */}
                    <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                placeholder="Search articles..." 
                                className="pl-10 h-14 rounded-2xl border-gray-200 dark:border-gray-800"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
                            <Button 
                                variant={selectedCategory === null ? 'default' : 'outline'}
                                className={selectedCategory === null ? 'bg-[#8B1E1E] text-white hover:bg-[#7a1a1a]' : ''}
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </Button>
                            {categories.map(cat => (
                                <Button 
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'outline'}
                                    className={selectedCategory === cat ? 'bg-[#C5A03A] text-white hover:bg-[#b08e30]' : ''}
                                    onClick={() => setSelectedCategory(cat as string)}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-64 w-full rounded-3xl" />
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No articles found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search or category filters.</p>
                            <Button variant="link" onClick={() => {setSearchTerm(''); setSelectedCategory(null);}} className="text-[#8B1E1E] mt-4">
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredPosts.map(post => (
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
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</span>
                                            {post.category && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-[10px] font-bold text-[#C5A03A] uppercase tracking-widest">{post.category}</span>
                                                </>
                                            )}
                                        </div>
                                        <Link to={`/blog/${post.slug}`}>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                                                {post.title}
                                            </h4>
                                        </Link>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                                            {post.excerpt || post.content.substring(0, 150) + '...'}
                                        </p>
                                        <div className="mt-auto">
                                            <Link to={`/blog/${post.slug}`} className="inline-flex items-center text-[#8B1E1E] font-bold text-xs uppercase tracking-widest hover:text-[#C5A03A] transition-colors">
                                                Read More <ArrowRight className="ml-2 w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
