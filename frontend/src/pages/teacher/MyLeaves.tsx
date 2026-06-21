import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/AuthProvider';
import { api } from '@/lib/api';
import type { Leave } from '../../types';
import { Plus, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const MyLeaves = () => {
    const {  } = useAuth();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form State
    const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Emergency'>('Casual');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const [expandedLeave, setExpandedLeave] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves');
            if (Array.isArray(res.data)) {
                setLeaves(res.data);
            } else if (res.data && Array.isArray(res.data.leaves)) {
                setLeaves(res.data.leaves);
            } else if (res.data && Array.isArray(res.data.data)) {
                setLeaves(res.data.data);
            } else {
                setLeaves([]);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load leave history');
            setLoading(false);
        }
    };

    const handleCreateLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/leaves', {
                leaveType,
                startDate,
                endDate,
                reason
            });
            
            setLeaves(prev => {
                const arr = Array.isArray(prev) ? prev : [];
                return [res.data, ...arr];
            });
            setIsCreateModalOpen(false);
            setStartDate('');
            setEndDate('');
            setReason('');
            toast.success('Leave application submitted successfully');
            fetchLeaves(); // Refresh
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        }
    };

    const handleDelete = async (leaveId: string) => {
         if (!confirm("Are you sure you want to cancel this leave application?")) return;
         try {
             await api.delete(`/leaves/${leaveId}`);
             setLeaves(prev => (Array.isArray(prev) ? prev.filter(l => l._id !== leaveId) : []));
             toast.success("Leave application canceled.");
         } catch (error: any) {
             toast.error(error.response?.data?.message || "Could not cancel application");
         }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };
    
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    const getTypeStyle = (type: string) => {
         switch (type) {
             case 'Sick': return 'text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-xs font-semibold';
             case 'Emergency': return 'text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full text-xs font-semibold';
             default: return 'text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-semibold';
         }
    };

    const calculateDays = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e.getTime() - s.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        return diffDays;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Leave Requests</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage your absence applications</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Apply for Leave
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                </div>
            ) : leaves.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No leave applications</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">You haven't requested any time off yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leaves.map((leave) => (
                        <div key={leave._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all shadow-sm hover:shadow-md">
                            <div 
                                className="p-5 cursor-pointer flex justify-between items-start"
                                onClick={() => setExpandedLeave(expandedLeave === leave._id ? null : leave._id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center ${getStatusStyle(leave.status)}`}>
                                            <span className="mr-1">{getStatusIcon(leave.status)}</span>
                                            {leave.status}
                                        </span>
                                        <span className={getTypeStyle(leave.leaveType)}>{leave.leaveType} Leave</span>
                                        <span className="text-xs font-medium text-slate-500 border rounded-full px-2 py-0.5">
                                            {calculateDays(leave.startDate, leave.endDate)} {calculateDays(leave.startDate, leave.endDate) === 1 ? 'Day' : 'Days'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 line-clamp-2">{leave.reason}</p>
                                </div>
                                <div className="ml-4 flex flex-col items-end space-y-4">
                                     {expandedLeave === leave._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                     {leave.status === 'Pending' && (
                                         <button onClick={(e) => { e.stopPropagation(); handleDelete(leave._id); }} className="text-xs text-red-500 hover:underline">Cancel</button>
                                     )}
                                </div>
                            </div>
                            
                            {/* Expanded Area */}
                            {expandedLeave === leave._id && (
                                <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2 bg-slate-50 dark:bg-slate-900">
                                    <div className="py-4">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Detailed Reason</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{leave.reason}</p>
                                        
                                        {leave.remarks && (
                                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
                                                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-1">Administrative Remarks</h4>
                                                <p className="text-sm text-amber-900 dark:text-amber-200">{leave.remarks}</p>
                                            </div>
                                        )}
                                        <div className="mt-4 text-xs tracking-wide text-slate-400">
                                            Application Timestamp: {new Date(leave.createdAt).toLocaleString()}
                                        </div>
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
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Apply for Leave</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateLeave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leave Category</label>
                                <select 
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value as any)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 dark:text-white"
                                >
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Emergency">Emergency Leave</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input 
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <input 
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Reason</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none text-slate-800 dark:text-white"
                                    placeholder="Provide context for your absence..."
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
