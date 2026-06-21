import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { BlogPost } from '../../types';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Globe,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { BlogComment } from '@/types';
import { format } from 'date-fns';
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const BlogManagement = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Comments State
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: '',
        authorName: '',
        category: '',
        tags: '',
        excerpt: '',
        isPublished: true
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
        const host = apiBase.split('/api')[0];
        return `${host}${path}`;
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/blog/admin/all');
            setPosts(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };
    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const res = await api.get('/comments/admin/all');
            setComments(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const handleDeleteComment = async (id: string) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/comments/${id}`);
            toast.success('Comment deleted');
            fetchComments();
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const toggleApproval = async (id: string) => {
        try {
            await api.patch(`/comments/${id}/approve`);
            toast.success('Comment status updated');
            fetchComments();
        } catch (error) {
            toast.error('Failed to update comment status');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenCreate = () => {
        setEditingPost(null);
        setFormData({
            title: '',
            content: '',
            imageUrl: '',
            authorName: '',
            category: '',
            tags: '',
            excerpt: '',
            isPublished: true
        });
        setSelectedFile(null);
        setImagePreview(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl || '',
            authorName: post.authorName || '',
            category: post.category || '',
            tags: post.tags?.join(', ') || '',
            excerpt: post.excerpt || '',
            isPublished: post.isPublished
        });
        setSelectedFile(null);
        setImagePreview(getImageUrl(post.imageUrl || '') || null);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsSaving(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('authorName', formData.authorName);
            data.append('category', formData.category);
            data.append('tags', formData.tags);
            data.append('excerpt', formData.excerpt);
            data.append('isPublished', String(formData.isPublished));
            
            if (selectedFile) {
                data.append('image', selectedFile);
            } else if (formData.imageUrl) {
                data.append('imageUrl', formData.imageUrl);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editingPost) {
                await api.put(`/blog/${editingPost._id}`, data, config);
                toast.success('Blog post updated successfully');
            } else {
                await api.post('/blog', data, config);
                toast.success('Blog post created successfully');
            }
            setIsDialogOpen(false);
            fetchPosts();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save blog post');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, postId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/blog/${postId}`);
            toast.success('Blog post deleted');
            fetchPosts();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to delete post');
        }
    };

    const togglePublish = async (post: BlogPost) => {
        try {
            await api.put(`/blog/${post._id}`, { isPublished: !post.isPublished });
            toast.success(`Post ${!post.isPublished ? 'published' : 'unpublished'}`);
            fetchPosts();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 space-y-10 bg-gradient-to-br from-white via-[#fcfaf4] to-[#f5f0e1] min-h-screen relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8B1E1E]/[0.015] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#C5A03A]/[0.02] rounded-full blur-[80px] pointer-events-none" />
            

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#8B1E1E] tracking-tight">Content Management</h1>
                    <p className="text-sm text-black font-black mt-1 uppercase tracking-[0.2em] opacity-80">Digital Authoring & Community Moderation</p>
                </div>
                <Button 
                    onClick={handleOpenCreate}
                    className="bg-[#8B1E1E] hover:bg-[#701818] text-white flex items-center gap-2 shadow-xl shadow-[#8B1E1E]/20 px-6 py-6 rounded-xl font-bold transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" /> Create Masterpiece
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                <Card className="bg-white shadow-xl shadow-[#8B1E1E]/5 hover:shadow-[#8B1E1E]/10 transition-all group overflow-hidden relative border-[#8B1E1E]/10">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B1E1E]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#8B1E1E]/10 transition-colors" />
                    <CardHeader className="pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E1E]/60">Total Stories</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-[#8B1E1E]">{posts.length}</div>
                        <p className="text-[10px] text-green-600 font-bold mt-1">Institutional Updates</p>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-xl shadow-[#C5A03A]/5 hover:shadow-[#C5A03A]/10 transition-all group overflow-hidden relative border-[#C5A03A]/10">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A03A]/5 rounded-full -mr-12 -mt-12 group-hover:bg-[#C5A03A]/10 transition-colors" />
                    <CardHeader className="pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5A03A]/60">Live Now</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-[#C5A03A]">{posts.filter(p => p.isPublished).length}</div>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">Visible to Community</p>
                    </CardContent>
                </Card>
                <Card className="bg-white shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all group overflow-hidden relative border-blue-100">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-100 transition-colors" />
                    <CardHeader className="pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600/60">Discussions</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-blue-600">{comments.length}</div>
                        <p className="text-[10px] text-blue-400 font-bold mt-1">Reader Interactions</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#8B1E1E] border-none shadow-2xl shadow-[#8B1E1E]/20 group overflow-hidden relative text-white">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:bg-white/20 transition-colors" />
                    <CardHeader className="pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Unmoderated</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{comments.filter(c => !c.isApproved).length}</div>
                        <p className="text-[10px] text-white/60 font-bold mt-1">Pending Approval</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="posts" className="w-full relative z-10">
                <TabsList className="bg-white border-2 border-gray-100 rounded-2xl p-1.5 shadow-xl shadow-gray-200/20 mb-8 inline-flex">
                    <TabsTrigger value="posts" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#8B1E1E] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#8B1E1E]/30 transition-all font-bold text-sm">
                        <FileText className="w-4 h-4 mr-2" /> Digital Stories
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-[#C5A03A] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#C5A03A]/30 transition-all font-bold text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4 mr-2" /> Community Feedback
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="posts">
                    <Card className="bg-white border-2 border-gray-100 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4 px-2">
                        <div className="flex items-center gap-3 border-2 border-[#8B1E1E]/20 rounded-2xl px-4 py-2 bg-white focus-within:border-[#8B1E1E] focus-within:ring-4 focus-within:ring-[#8B1E1E]/5 transition-all w-full md:w-96">
                            <Search className="w-5 h-5 text-[#8B1E1E]" />
                            <input 
                                placeholder="Search by title or author..." 
                                className="bg-transparent border-none outline-none text-sm w-full font-bold text-black placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white text-xs font-bold py-1 px-3 border-[#8B1E1E]/10">
                                {filteredPosts.length} Items Found
                            </Badge>
                        </div>
                    </div>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#8B1E1E]" />
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-600">No blog posts found</h3>
                                    <p className="text-gray-400">Start by creating your first post!</p>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader className="bg-gray-50 border-y-2 border-gray-100">
                                            <TableRow>
                                                <TableHead className="py-4 text-black font-black uppercase text-[10px] tracking-widest">Story & Excerpt</TableHead>
                                                <TableHead className="hidden md:table-cell text-black font-black uppercase text-[10px] tracking-widest">Contributor</TableHead>
                                                <TableHead className="hidden md:table-cell text-black font-black uppercase text-[10px] tracking-widest">Publication Date</TableHead>
                                                <TableHead className="text-black font-black uppercase text-[10px] tracking-widest">Visibility</TableHead>
                                                <TableHead className="text-right text-black font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPosts.map((post) => (
                                                <TableRow key={post._id} className="hover:bg-gray-50 transition-colors border-b last:border-0 group">
                                                    <TableCell className="py-5">
                                                        <div className="flex items-center gap-4">
                                                            {post.imageUrl ? (
                                                                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden border-2 border-white shadow-md transition-transform group-hover:scale-105">
                                                                    <img src={getImageUrl(post.imageUrl)} alt={post.title} className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 border-2 border-dashed border-gray-200">
                                                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                                                </div>
                                                            )}
                                                            <div className="max-w-[200px] md:max-w-md space-y-1.5">
                                                                <p className="font-black text-black text-lg leading-tight group-hover:text-[#8B1E1E] transition-colors">{post.title}</p>
                                                                <p className="text-sm text-gray-800 font-bold line-clamp-1">{post.excerpt || post.content.substring(0, 100)}</p>
                                                                <div className="flex gap-2 mt-2">
                                                                    {post.category && <Badge className="bg-[#C5A03A] text-white border-none text-[10px] px-2 py-0.5 shadow-sm uppercase font-black tracking-widest">{post.category}</Badge>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#C5A03A] flex items-center justify-center text-white font-black text-xs shadow-sm">
                                                                {post.authorName ? post.authorName[0].toUpperCase() : 'A'}
                                                            </div>
                                                            <span className="text-sm font-black text-black uppercase tracking-tighter">{post.authorName || 'Admin'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-black">{format(new Date(post.createdAt), 'MMM dd')}</span>
                                                            <span className="text-[10px] text-[#C5A03A] font-black uppercase tracking-widest">{format(new Date(post.createdAt), 'yyyy')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className={`h-9 font-black text-[11px] uppercase tracking-[0.1em] px-5 rounded-full border-2 shadow-sm transition-all ${
                                                                post.isPublished 
                                                                ? 'text-green-700 border-green-600 bg-green-50 hover:bg-green-700 hover:text-white hover:border-green-700' 
                                                                : 'text-[#C5A03A] border-[#C5A03A] bg-amber-50 hover:bg-[#C5A03A] hover:text-white hover:border-[#C5A03A]'
                                                            }`}
                                                            onClick={() => togglePublish(post)}
                                                        >
                                                            {post.isPublished ? "Published" : "Draft Mode"}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2 pr-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-10 px-4 border-2 border-[#8B1E1E] text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-white hover:border-[#8B1E1E] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md bg-white"
                                                                onClick={() => handleOpenEdit(post)}
                                                            >
                                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-10 px-4 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md bg-white"
                                                                onClick={(e) => handleDelete(e, post._id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comments">
                    <Card className="bg-white border-2 border-gray-100 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden mt-6">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <h3 className="text-lg font-bold text-[#8B1E1E]">Reader Discussions</h3>
                            <Badge variant="outline" className="text-xs">{comments.length} total comments</Badge>
                        </CardHeader>
                        <CardContent>
                            {loadingComments ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#8B1E1E]" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-600">No comments found</h3>
                                    <p className="text-gray-400">Reader comments will appear here for moderation.</p>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50">
                                                <TableHead className="font-bold">Contributor</TableHead>
                                                <TableHead className="font-bold">Discussion Content</TableHead>
                                                <TableHead className="font-bold">Target Story</TableHead>
                                                <TableHead className="font-bold">Visibility</TableHead>
                                                <TableHead className="text-right font-bold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {comments.map((comment) => (
                                                <TableRow key={comment._id} className="hover:bg-gray-50 transition-colors border-b last:border-0 group">
                                                    <TableCell className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-2xl bg-[#8B1E1E] flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white">
                                                                {comment.name ? comment.name[0].toUpperCase() : 'C'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-black text-sm uppercase tracking-tighter">{comment.name}</span>
                                                                <span className="text-xs text-gray-700 font-bold">{comment.email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-md p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                                                            <p className="text-sm text-black font-bold line-clamp-2 italic leading-relaxed">"{comment.content}"</p>
                                                            <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2">
                                                                <span className="text-[10px] uppercase font-black tracking-widest text-[#8B1E1E]">Post Ref:</span>
                                                                <span className="text-[10px] font-black text-black underline decoration-[#C5A03A]/30 truncate max-w-[150px]">{(comment.blogPost as any)?.title || 'Original Post'}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-black">{format(new Date(comment.createdAt), 'MMM dd')}</span>
                                                            <span className="text-[10px] text-[#C5A03A] font-black uppercase tracking-widest">{format(new Date(comment.createdAt), 'yyyy')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className={`h-9 font-black text-[11px] uppercase tracking-[0.1em] px-5 rounded-full border-2 shadow-sm transition-all ${
                                                                comment.isApproved 
                                                                ? 'text-green-700 border-green-600 bg-green-50 hover:bg-green-700 hover:text-white hover:border-green-700' 
                                                                : 'text-[#C5A03A] border-[#C5A03A] bg-amber-50 hover:bg-[#C5A03A] hover:text-white hover:border-[#C5A03A]'
                                                            }`}
                                                            onClick={() => toggleApproval(comment._id)}
                                                        >
                                                            {comment.isApproved ? "Public" : "Hidden"}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2 pr-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className={`h-10 px-4 border-2 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md bg-white ${
                                                                    comment.isApproved 
                                                                    ? 'border-[#C5A03A] text-[#C5A03A] hover:bg-[#C5A03A] hover:text-white' 
                                                                    : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                                                                }`}
                                                                onClick={() => toggleApproval(comment._id)}
                                                            >
                                                                {comment.isApproved ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                                                {comment.isApproved ? "Unapprove" : "Approve"}
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-10 px-4 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md bg-white"
                                                                onClick={() => handleDeleteComment(comment._id)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center gap-2 text-[#8B1E1E] mb-2">
                             <Sparkles className="w-5 h-5 fill-current" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authoring Studio</span>
                        </div>
                        <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">
                            {editingPost ? 'Refine Your Story' : 'Compose New Masterpiece'}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-muted-foreground">
                            Craft a professional update for the FirstBorn Technologies community.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column: Post Content */}
                            <div className="md:col-span-2 space-y-6 border-r pr-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-[11px] font-black uppercase tracking-wider text-[#8B1E1E]">Headline *</Label>
                                        <Input 
                                            id="title" 
                                            placeholder="Enter a captivating headline..." 
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="text-xl font-bold border-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-[#8B1E1E]/5 transition-all h-14 rounded-2xl placeholder:text-gray-300"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="content" className="text-[11px] font-black uppercase tracking-wider text-[#8B1E1E]">Story Content *</Label>
                                            <div className="flex gap-1">
                                                {['B', 'I', 'U'].map(btn => (
                                                    <Button key={btn} type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-[10px] font-black hover:bg-[#8B1E1E]/5 hover:text-[#8B1E1E]">
                                                        {btn}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <Textarea 
                                            id="content" 
                                            placeholder="Write your professional update here..." 
                                            value={formData.content}
                                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                                            className="min-h-[400px] border-none bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-[#8B1E1E]/5 transition-all leading-relaxed font-sans text-lg rounded-2xl resize-none p-6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Metadata & Settings */}
                            <div className="space-y-6">
                                <div className="p-5 bg-[#C5A03A]/[0.03] rounded-3xl border border-[#C5A03A]/10 space-y-6">
                                    <div className="flex items-center gap-2 text-[#C5A03A] mb-2 border-b border-[#C5A03A]/10 pb-3">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Post Settings</span>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="authorName" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Author Display</Label>
                                        <Input 
                                            id="authorName" 
                                            placeholder="Your Name" 
                                            value={formData.authorName}
                                            onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                                            className="bg-white border-none shadow-sm h-10 rounded-xl text-sm font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</Label>
                                        <Input 
                                            id="category" 
                                            placeholder="e.g. Technology" 
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="bg-white border-none shadow-sm h-10 rounded-xl text-sm font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Featured Graphic</Label>
                                        <div 
                                            className="group relative h-40 rounded-2xl bg-white border-2 border-dashed border-[#C5A03A]/20 hover:border-[#C5A03A]/40 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden shadow-sm"
                                            onClick={() => document.getElementById('imageUpload')?.click()}
                                        >
                                            <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <Button type="button" variant="secondary" size="sm" className="font-black text-[10px] rounded-full uppercase">Update Graphic</Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#C5A03A]/10 flex items-center justify-center text-[#C5A03A] mx-auto mb-2">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-[#C5A03A] uppercase tracking-tighter">Upload Visual</p>
                                                </div>
                                            )}
                                        </div>
                                        <Input 
                                            placeholder="Or paste URL here..." 
                                            className="h-8 text-[10px] font-semibold bg-white/50 border-none shadow-inner rounded-lg"
                                            value={formData.imageUrl}
                                            onChange={(e) => {
                                                setFormData({...formData, imageUrl: e.target.value});
                                                if (e.target.value) setImagePreview(e.target.value);
                                            }}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-[#C5A03A]/10">
                                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-[#C5A03A]/10">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${formData.isPublished ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
                                                <span className="text-[10px] font-black uppercase text-gray-600">{formData.isPublished ? 'Live' : 'Draft'}</span>
                                            </div>
                                            <Switch 
                                                checked={formData.isPublished}
                                                onCheckedChange={(checked) => setFormData({...formData, isPublished: checked})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t gap-3">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded-xl font-bold text-gray-400 hover:text-gray-600"
                            >
                                Discard Changes
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-[#8B1E1E] hover:bg-[#701818] text-white px-10 py-6 rounded-2xl font-black text-sm shadow-xl shadow-[#8B1E1E]/20 transition-all hover:scale-105"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        {editingPost ? 'Update & Sync' : 'Deploy Masterpiece'}
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
