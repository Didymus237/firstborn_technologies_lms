import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Complaint } from '../../types';
import { MessageSquare, ChevronDown, ChevronUp, Users, Filter, Reply, Sparkles, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/AuthProvider';

export const ManageComplaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');

    // Action State
    const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [adminRemarks, setAdminRemarks] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            if (Array.isArray(res.data)) {
                setComplaints(res.data);
            } else if (res.data && Array.isArray(res.data.complaints)) {
                setComplaints(res.data.complaints);
            } else if (res.data && Array.isArray(res.data.data)) {
                setComplaints(res.data.data);
            } else {
                console.error("Invalid complaint data structure:", res.data);
                toast.error("Format schema violation on fetched tickets.");
                setComplaints([]);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load global complaints array');
            setLoading(false);
        }
    };

    const handleReply = async (complaintId: string) => {
        if (!replyMessage.trim()) return;
        try {
            await api.post(`/complaints/${complaintId}/reply`, { message: replyMessage });
            setReplyMessage('');
            fetchComplaints();
            toast.success('Admin Response deployed successfully.');
        } catch (error) {
            toast.error('Failed to dispatch response');
        }
    };

    const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
        try {
            await api.put(`/complaints/${complaintId}/status`, { status: newStatus, remarks: adminRemarks || undefined });
            toast.success(`Systematic Status forced to ${newStatus}`);
            setAdminRemarks('');
            fetchComplaints();
        } catch (error) {
            toast.error('Could not forcefully update status');
        }
    }

    const filteredComplaints = complaints.filter(c => {
        if (statusFilter !== 'All' && c.status !== statusFilter) return false;
        if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
        return true;
    });

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

    const getSeverityStyle = (severity: string | undefined) => {
        switch (severity) {
            case 'Critical': return 'bg-rose-600 text-white shadow-rose-500/30';
            case 'High': return 'bg-orange-500 text-white shadow-orange-500/30';
            case 'Medium': return 'bg-amber-400 text-amber-900 shadow-amber-400/30';
            case 'Low': return 'bg-emerald-500 text-white shadow-emerald-500/30';
            default: return 'bg-slate-500 text-white';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Global Helpdesk Administration</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total systemic oversight over all internal/external queries</p>
                </div>
            </div>

            <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <Filter className="w-5 h-5 text-slate-400" />
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
                >
                    <option value="All">All Statuses</option>
                    <option value="Submitted">Submitted (Pending)</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                </select>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
                >
                    <option value="All">All Categories</option>
                    <option value="Academic">Academic</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Faculty">Faculty Issue</option>
                    <option value="Other">Other</option>
                </select>
                <div className="text-sm text-slate-500 font-medium ml-auto">
                    {filteredComplaints.length} Tickets Found
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                </div>
            ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No matching tickets</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting the universal filters above.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredComplaints.map((complaint) => (
                        <div key={complaint._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all shadow-sm">
                            <div 
                                className="p-5 cursor-pointer flex justify-between items-start"
                                onClick={() => setExpandedComplaint(expandedComplaint === complaint._id ? null : complaint._id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${getStatusStyle(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                        {complaint.aiSeverity ? (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm flex items-center ${getSeverityStyle(complaint.aiSeverity)}`}>
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                {complaint.aiSeverity}
                                            </span>
                                        ) : (
                                            <span className={getPriorityStyle(complaint.priority)}>{complaint.priority} Priority</span>
                                        )}
                                        <span className="text-xs font-semibold text-slate-500 border rounded-full px-2 py-0.5">{complaint.category}</span>
                                        
                                        {complaint.aiPriorityScore && (
                                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                                SCORE: {complaint.aiPriorityScore}/100
                                            </span>
                                        )}
                                        
                                        <span className="text-xs text-slate-400 tracking-wider font-medium">{new Date(complaint.createdAt).toLocaleString()}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white tracking-tight">{complaint.title}</h3>
                                    
                                    <div className="flex items-center space-x-4 mt-3">
                                        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                                            <Users className="w-4 h-4 text-indigo-500" />
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {(complaint.studentId && typeof complaint.studentId === 'object') ? (complaint.studentId as any).name : 'Unknown Student'}
                                            </span>
                                        </div>
                                        {complaint.targetId && (
                                            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                                                <span>Routed to:</span>
                                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {(complaint.targetId && typeof complaint.targetId === 'object') ? (complaint.targetId as any).name : 'General Faculty'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 flex flex-col items-end">
                                     {expandedComplaint === complaint._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </div>
                            </div>
                            
                            {/* Expanded Area */}
                            {expandedComplaint === complaint._id && (
                                <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="py-4 grid grid-cols-3 gap-6">
                                        <div className="col-span-2">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Issue Payload</h4>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                                {complaint.description}
                                            </p>
                                        </div>
                                        <div className="col-span-1 space-y-4">
                                             {complaint.aiSuggestedAction && (
                                                 <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden">
                                                     <div className="absolute top-0 right-0 p-2 opacity-10">
                                                         <BrainCircuit className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                                                     </div>
                                                     <div className="relative z-10">
                                                         <div className="flex items-center space-x-2 mb-2">
                                                             <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                             <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">AI Insights Panel</h4>
                                                         </div>
                                                         <p className="text-sm text-indigo-900 dark:text-indigo-200 mb-3 leading-relaxed">
                                                             <strong>Action:</strong> {complaint.aiSuggestedAction}
                                                         </p>
                                                         {complaint.aiSuggestedReply && (
                                                             <button 
                                                                 onClick={() => setReplyMessage(complaint.aiSuggestedReply!)}
                                                                 className="text-[10px] uppercase tracking-widest font-bold bg-white text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 px-3 py-1.5 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors w-full text-center"
                                                             >
                                                                 Load Suggested Reply
                                                             </button>
                                                         )}
                                                     </div>
                                                 </div>
                                             )}

                                             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Force Status Engine</h4>
                                                 <div className="space-y-3">
                                                     <input 
                                                          type="text" 
                                                          placeholder="Optional administrative remarks..."
                                                          value={adminRemarks}
                                                          onChange={e => setAdminRemarks(e.target.value)}
                                                          className="w-full text-xs px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
                                                     />
                                                     <div className="flex flex-wrap gap-2">
                                                         <button onClick={() => handleStatusUpdate(complaint._id, 'In Review')} className="text-xs px-3 py-1.5 rounded-md font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">Mark In Review</button>
                                                         <button onClick={() => handleStatusUpdate(complaint._id, 'Resolved')} className="text-xs px-3 py-1.5 rounded-md font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors">Force Resolve</button>
                                                         <button onClick={() => handleStatusUpdate(complaint._id, 'Rejected')} className="text-xs px-3 py-1.5 rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Force Reject</button>
                                                     </div>
                                                 </div>
                                             </div>
                                        </div>
                                    </div>

                                    {/* Discussion Thread */}
                                    <div className="mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Official Communication Thread</h4>
                                        
                                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                                            {complaint.responses.length === 0 ? (
                                                <div className="text-center py-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <p className="text-sm text-slate-400 italic">No activity detected natively.</p>
                                                </div>
                                            ) : (
                                                complaint.responses.map((resp, i) => {
                                                    const isMe = (resp.respondent as any)._id === user?._id || resp.respondent === user?._id;
                                                    const isAdmin = (resp.respondent as any).role === 'admin';
                                                    return (
                                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                                isMe ? 'bg-slate-800 text-white dark:bg-slate-700 rounded-br-none' : 
                                                                isAdmin ? 'bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 rounded-bl-none' : 
                                                                'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                                            }`}>
                                                                <div className="flex justify-between items-center mb-1 space-x-3">
                                                                    <span className={`text-xs font-bold ${isMe ? 'text-slate-300' : isAdmin ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                        {isMe ? 'You (Admin)' : (resp.respondent as any).name} 
                                                                        {(!isMe && (resp.respondent as any).role) && ` [${(resp.respondent as any).role.toUpperCase()}]`}
                                                                    </span>
                                                                    <span className={`text-[10px] ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                                                                        {new Date(resp.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-sm ${isMe ? 'text-slate-100' : isAdmin ? 'text-rose-900 dark:text-rose-200' : 'text-slate-700 dark:text-slate-300'}`}>{resp.message}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>

                                        <div className="flex flex-col bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                                            <textarea 
                                                value={replyMessage}
                                                onChange={e => setReplyMessage(e.target.value)}
                                                placeholder="Dispatch official administrative response..."
                                                className="w-full px-3 py-2 bg-transparent text-sm resize-none focus:outline-none text-slate-800 dark:text-white"
                                                rows={2}
                                            />
                                            <div className="flex justify-between items-center px-2 pb-1">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Internal Logging System</span>
                                                <button 
                                                    onClick={() => handleReply(complaint._id)}
                                                    disabled={!replyMessage.trim()}
                                                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold tracking-wide transition-colors flex items-center"
                                                >
                                                    <Reply className="w-3 h-3 mr-1" />
                                                    Dispatch
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
