import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/AuthProvider';
import { api } from '@/lib/api';
import type { Complaint } from '../../types';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export const MyComplaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'Academic' | 'Facilities' | 'Faculty' | 'Other'>('Academic');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [targetTeacher, setTargetTeacher] = useState('');

    const [teachers, setTeachers] = useState<{_id: string, name: string}[]>([]);
    
    // View State
    const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState('');

    useEffect(() => {
        fetchComplaints();
        fetchTeachers();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            
            if (Array.isArray(res.data)) {
                setComplaints(res.data);
            } else if (res.data && Array.isArray(res.data.complaints)) {
                setComplaints(res.data.complaints);
            } else {
                console.error('Invalid complaint load payload from server:', typeof res.data);
                toast.error('Data loading error: Invalid structure returned.');
                setComplaints([]);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load complaints');
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
         try {
             // Basic fetch from public or users (if student has access). Assuming /api/users works for teachers
             const res = await api.get('/users?role=teacher');
             if (Array.isArray(res.data)) {
                 setTeachers(res.data);
             } else if (res.data && Array.isArray(res.data.data)) {
                 setTeachers(res.data.data);
             } else {
                 setTeachers([]);
             }
         } catch (error) {
             console.error("Could not fetch teachers list", error);
             setTeachers([]);
         }
    };

    const handleCreateComplaint = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/complaints', {
                title,
                description,
                category,
                priority,
                targetId: targetTeacher || undefined
            });
            
            setComplaints(prev => {
                const arr = Array.isArray(prev) ? prev : [];
                return [res.data, ...arr]
            });
            setIsCreateModalOpen(false);
            setTitle('');
            setDescription('');
            setTargetTeacher('');
            toast.success('Complaint submitted successfully');
            fetchComplaints(); // refresh to get populated refs natively
        } catch (error: any) {
            console.error(error);
            const detailedMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Submission failed';
            toast.error(`ERROR: ${detailedMsg}`);
        }
    };

    const handleReply = async (complaintId: string) => {
        if (!replyMessage.trim()) return;
        try {
            await api.post(`/complaints/${complaintId}/reply`, { message: replyMessage });
            setReplyMessage('');
            fetchComplaints();
            toast.success('Reply added');
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    const handleDelete = async (complaintId: string) => {
         if (!confirm("Are you sure you want to delete this complaint?")) return;
         try {
             await api.delete(`/complaints/${complaintId}`);
             setComplaints(complaints.filter(c => c._id !== complaintId));
             toast.success("Complaint deleted.");
         } catch (error: any) {
             toast.error(error.response?.data?.message || "Could not delete complaint");
         }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'In Review': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            default: return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };
    
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'In Review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    const getPriorityStyle = (priority: string) => {
         switch (priority) {
             case 'High': return 'text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-xs font-semibold';
             case 'Low': return 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-semibold';
             default: return 'text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full text-xs font-semibold';
         }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Complaints / Queries</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage your Helpdesk tickets</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Request
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                </div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No active complaints</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">You haven't submitted any queries or grievances yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints.map((complaint) => (
                        <div key={complaint._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all shadow-sm hover:shadow-md">
                            <div 
                                className="p-5 cursor-pointer flex justify-between items-start"
                                onClick={() => setExpandedComplaint(expandedComplaint === complaint._id ? null : complaint._id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center ${getStatusStyle(complaint.status)}`}>
                                            <span className="mr-1">{getStatusIcon(complaint.status)}</span>
                                            {complaint.status}
                                        </span>
                                        <span className={getPriorityStyle(complaint.priority)}>{complaint.priority}</span>
                                        <span className="text-xs font-medium text-slate-500 border rounded-full px-2 py-0.5">{complaint.category}</span>
                                        <span className="text-xs text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{complaint.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 line-clamp-2">{complaint.description}</p>
                                </div>
                                <div className="ml-4 flex flex-col items-end space-y-4">
                                     {expandedComplaint === complaint._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                     {complaint.status === 'Submitted' && (
                                         <button onClick={(e) => { e.stopPropagation(); handleDelete(complaint._id); }} className="text-xs text-red-500 hover:underline">Delete</button>
                                     )}
                                </div>
                            </div>
                            
                            {/* Expanded Area */}
                            {expandedComplaint === complaint._id && (
                                <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2 bg-slate-50 dark:bg-slate-900">
                                    <div className="py-4">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Details</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{complaint.description}</p>
                                        
                                        {complaint.targetId && (
                                            <div className="mt-3 text-sm text-slate-500">
                                                Routed directly to: <span className="font-semibold text-slate-700 dark:text-slate-300">{(complaint.targetId && typeof complaint.targetId === 'object') ? (complaint.targetId as any).name : 'Faculty Member'}</span>
                                            </div>
                                        )}
                                        {complaint.remarks && (
                                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
                                                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-1">Administrative Remarks</h4>
                                                <p className="text-sm text-amber-900 dark:text-amber-200">{complaint.remarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Discussion Thread */}
                                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Communication Thread</h4>
                                        
                                        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
                                            {complaint.responses.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic">No responses yet.</p>
                                            ) : (
                                                complaint.responses.map((resp, i) => {
                                                    const isMe = (resp.respondent as any)._id === user?._id || resp.respondent === user?._id;
                                                    return (
                                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-bl-none'}`}>
                                                                <div className="flex justify-between items-center mb-1 space-x-2">
                                                                    <span className={`text-xs font-bold ${isMe ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                        {isMe ? 'You' : (resp.respondent as any).name || 'Staff'} 
                                                                        {(!isMe && (resp.respondent as any).role) && ` (${(resp.respondent as any).role})`}
                                                                    </span>
                                                                    <span className={`text-[10px] ${isMe ? 'text-indigo-300' : 'text-slate-400'}`}>{new Date(resp.timestamp).toLocaleString([], { hour: '2-digit', minute:'2-digit', month:'short', day:'numeric' })}</span>
                                                                </div>
                                                                <p className="text-sm">{resp.message}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>

                                        {(complaint.status !== 'Resolved' && complaint.status !== 'Rejected') && (
                                            <div className="flex items-center space-x-2">
                                                <input 
                                                    type="text" 
                                                    value={replyMessage}
                                                    onChange={e => setReplyMessage(e.target.value)}
                                                    placeholder="Type a message to staff..."
                                                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                                                    onKeyDown={(e) => { if(e.key === 'Enter') handleReply(complaint._id); }}
                                                />
                                                <button 
                                                    onClick={() => handleReply(complaint._id)}
                                                    disabled={!replyMessage.trim()}
                                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 text-sm font-medium transition-colors"
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden shadow-indigo-500/10">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Submit Helpdesk Request</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateComplaint} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 dark:text-white"
                                    placeholder="Brief title of your issue"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 dark:text-white"
                                    >
                                        <option value="Academic">Academic</option>
                                        <option value="Facilities">Facilities</option>
                                        <option value="Faculty">Faculty Issue</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                    <select 
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as any)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 dark:text-white"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High (Urgent)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Direct to Specific Teacher (Optional)</label>
                                <select 
                                    value={targetTeacher}
                                    onChange={(e) => setTargetTeacher(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 dark:text-white"
                                >
                                    <option value="">-- Route to General Administration --</option>
                                    {teachers.map(t => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-500 mt-1">If blank, it will be handled by the general Admin office.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none text-slate-800 dark:text-white"
                                    placeholder="Explain your situation specifically so we can help."
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
