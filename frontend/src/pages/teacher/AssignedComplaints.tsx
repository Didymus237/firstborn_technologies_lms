import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/AuthProvider';
import { api } from '@/lib/api';
import type { Complaint } from '../../types';
import { MessageSquare, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

export const AssignedComplaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    
    // View State
    const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState('');

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
                setComplaints([]);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load assigned complaints');
            setLoading(false);
        }
    };

    const handleReply = async (complaintId: string) => {
        if (!replyMessage.trim()) return;
        try {
            await api.post(`/complaints/${complaintId}/reply`, { message: replyMessage });
            setReplyMessage('');
            fetchComplaints();
            toast.success('Response sent');
        } catch (error) {
            toast.error('Failed to send response');
        }
    };

    const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
        try {
            await api.put(`/complaints/${complaintId}/status`, { status: newStatus });
            toast.success(`Complaint status set to ${newStatus}`);
            fetchComplaints();
        } catch (error) {
            toast.error('Could not update status');
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Assigned Complaints</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage Helpdesk inquiries routed directly to your desk.</p>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                </div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Clean Inbox</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">You have no active student complaints assigned to you.</p>
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
                                        {complaint.aiSeverity ? (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm flex items-center ${getSeverityStyle(complaint.aiSeverity)}`}>
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                {complaint.aiSeverity}
                                            </span>
                                        ) : (
                                            <span className={getPriorityStyle(complaint.priority)}>{complaint.priority} Priority</span>
                                        )}
                                        <span className="text-xs font-medium text-slate-500 border rounded-full px-2 py-0.5">{complaint.category}</span>
                                        {complaint.aiPriorityScore && (
                                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                                SCORE: {complaint.aiPriorityScore}/100
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{complaint.title}</h3>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                            {(complaint.studentId && typeof complaint.studentId === 'object') ? (complaint.studentId as any).name?.charAt(0) : '?'}
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {(complaint.studentId && typeof complaint.studentId === 'object') ? (complaint.studentId as any).name : complaint.studentId ? String(complaint.studentId) : 'Unknown'}
                                        </span>
                                        <span className="text-xs text-slate-400">({(complaint.studentId && typeof complaint.studentId === 'object') ? (complaint.studentId as any).enrollmentNumber : 'N/A'})</span>
                                    </div>
                                </div>
                                <div className="ml-4 flex flex-col items-end space-y-4">
                                     {expandedComplaint === complaint._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                     {(complaint.status !== 'Resolved' && complaint.status !== 'Rejected') && (
                                         <div className="flex space-x-2">
                                             <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(complaint._id, 'Resolved'); }} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200 hover:bg-green-100">Resolve</button>
                                             <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(complaint._id, 'Rejected'); }} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200 hover:bg-red-100">Reject</button>
                                         </div>
                                     )}
                                </div>
                            </div>
                            
                            {/* Expanded Area */}
                            {expandedComplaint === complaint._id && (
                                <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2 bg-slate-50 dark:bg-slate-900">
                                    <div className="py-4">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Detailed Issue</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{complaint.description}</p>
                                    </div>

                                    {complaint.aiSuggestedAction && (
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-4 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <BrainCircuit className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                    <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">AI Insights For Faculty</h4>
                                                </div>
                                                <p className="text-sm text-indigo-900 dark:text-indigo-200 mb-3 leading-relaxed">
                                                    <strong>Suggested Action:</strong> {complaint.aiSuggestedAction}
                                                </p>
                                                {complaint.aiSuggestedReply && (
                                                    <button 
                                                        onClick={() => setReplyMessage(complaint.aiSuggestedReply!)}
                                                        className="text-[10px] uppercase tracking-widest font-bold bg-white text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 px-3 py-1.5 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto text-center"
                                                    >
                                                        Pre-fill Suggested Reply
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
                                                                        {isMe ? 'You' : (resp.respondent as any).name || 'Student'} 
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
                                                    placeholder="Reply to the student..."
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
        </div>
    );
};
