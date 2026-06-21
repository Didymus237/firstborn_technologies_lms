import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Leave } from '../../types';
import { CheckCircle, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

export const ManageLeaves = () => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('Pending');

    // Action State
    const [adminRemarks, setAdminRemarks] = useState('');

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
            toast.error('Failed to aggregate Faculty Absence data');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (leaveId: string, newStatus: string) => {
        try {
            await api.put(`/leaves/${leaveId}/status`, { status: newStatus, remarks: adminRemarks || undefined });
            toast.success(`Leave Application ${newStatus}`);
            setAdminRemarks('');
            fetchLeaves();
        } catch (error) {
            toast.error('System refused status modification');
        }
    }

    const filteredLeaves = leaves.filter(l => {
        if (statusFilter !== 'All' && l.status !== statusFilter) return false;
        return true;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
            default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
        }
    };

    const getTypeStyle = (type: string) => {
         switch (type) {
             case 'Sick': return 'text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider';
             case 'Emergency': return 'text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider';
             default: return 'text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider';
         }
    };

    const calculateDays = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e.getTime() - s.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Leave Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enforce global absence validation executing countersignatures natively.</p>
                </div>
            </div>

            <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <Filter className="w-5 h-5 text-slate-400" />
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none"
                >
                    <option value="All">All Applications</option>
                    <option value="Pending">Pending Validation</option>
                    <option value="Approved">Approved Authorized</option>
                    <option value="Rejected">Systematically Rejected</option>
                </select>
                <div className="text-sm text-slate-500 font-medium ml-auto flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    {filteredLeaves.length} Logged Entries
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                </div>
            ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <CheckCircle className="w-12 h-12 text-green-400 dark:text-green-600 mx-auto mb-4 opacity-50, shadow-lg" />
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">All Clear</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">There are no leave applications matching this context.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeaves.map((leave) => (
                        <div key={leave._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all shadow-sm hover:shadow-md flex flex-col">
                            <div className={`p-4 flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-700 relative overflow-hidden`}>
                                {/* Abstract Background Header */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-100 to-transparent dark:from-slate-700 dark:to-transparent z-0"></div>
                                
                                <span className={`absolute top-4 right-4 ${getStatusStyle(leave.status)} px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full z-10 shadow-sm`}>
                                    {leave.status}
                                </span>
                                <span className={`absolute top-4 left-4 ${getTypeStyle(leave.leaveType)} z-10 shadow-sm`}>
                                    {leave.leaveType}
                                </span>
                                
                                <div className="w-16 h-16 rounded-full bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center text-xl font-bold mt-6 z-10 shadow-md ring-4 ring-white dark:ring-slate-800">
                                    {(leave.teacherId && typeof leave.teacherId === 'object') ? (leave.teacherId as any).name?.charAt(0) : '?'}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-3 z-10">
                                    {(leave.teacherId && typeof leave.teacherId === 'object') ? (leave.teacherId as any).name : 'Faculty Member'}
                                </h3>
                                {(leave.teacherId && typeof leave.teacherId === 'object' && (leave.teacherId as any).department) && (
                                     <p className="text-xs text-slate-500 dark:text-slate-400 font-medium z-10 uppercase tracking-widest">
                                         {(leave.teacherId as any).department} Engine
                                     </p>
                                )}
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex flex-col text-center w-full">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Duration Block</span>
                                        <div className="flex items-center justify-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                                            <span>{new Date(leave.startDate).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
                                            <span className="text-slate-300 dark:text-slate-600">→</span>
                                            <span>{new Date(leave.endDate).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                                            {calculateDays(leave.startDate, leave.endDate)} {calculateDays(leave.startDate, leave.endDate) === 1 ? 'Day' : 'Days'} Total
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Reason Context</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                                        "{leave.reason}"
                                    </p>
                                </div>

                                {leave.status === 'Pending' && (
                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col space-y-3">
                                        <input 
                                            type="text"
                                            value={adminRemarks}
                                            onChange={(e) => setAdminRemarks(e.target.value)}
                                            placeholder="Optional countersignature remarks..."
                                            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-indigo-500"
                                        />
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleStatusUpdate(leave._id, 'Approved')} 
                                                className="flex-1 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold tracking-wide text-xs py-2 rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                AUTHORIZE
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(leave._id, 'Rejected')} 
                                                className="flex-1 bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 font-bold tracking-wide text-xs py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                            >
                                                DENY
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {leave.remarks && leave.status !== 'Pending' && (
                                    <div className="mt-auto pt-4">
                                        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 p-3 rounded-lg">
                                            <span className="block text-[10px] text-amber-700 dark:text-amber-500 uppercase font-bold tracking-wider mb-1">Execution Remarks</span>
                                            <p className="text-xs text-amber-900 dark:text-amber-200">{leave.remarks}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
