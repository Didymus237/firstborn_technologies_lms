import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, ShieldCheck, School, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function VerifyReceipt() {
    const { id } = useParams<{ id: string }>();
    const [receipt, setReceipt] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVerification = async () => {
            try {
                const res = await api.get(`/receipts/${id}`);
                setReceipt(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Transaction hash could not be mathematically verified.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchVerification();
    }, [id]);

    if (isLoading) {
         return (
             <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
                 <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                 <h1 className="text-xl font-bold uppercase tracking-widest text-gray-500">Querying Global Ledger...</h1>
                 <p className="text-sm text-gray-400 mt-2">Connecting to Firstborn Authentic nodes.</p>
             </div>
         );
    }

    if (error || !receipt) {
         return (
             <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
                 <div className="bg-white dark:bg-[#111] p-10 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 max-w-lg w-full">
                     <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <XCircle className="w-10 h-10 text-red-600" />
                     </div>
                     <h1 className="text-3xl font-black uppercase text-gray-900 dark:text-white tracking-tight">Invalid Hash</h1>
                     <p className="text-gray-500 dark:text-gray-400 mt-2 font-mono text-sm">{id}</p>
                     <div className="mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-red-700 dark:text-red-400 font-bold text-sm">
                          {error}
                     </div>
                     <Link to="/" className="inline-block mt-8 text-indigo-600 font-bold hover:underline">Return to Main Portal</Link>
                 </div>
             </div>
         );
    }

    // Formatting currency natively
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const isVerified = receipt.status === 'Verified';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
             <div className="max-w-2xl w-full">
                  
                  {/* Banner */}
                  <div className={`w-full p-6 text-center rounded-t-3xl border-b-0 ${isVerified ? 'bg-emerald-600 text-white' : 'bg-yellow-500 text-white'}`}>
                       <ShieldCheck className="w-16 h-16 mx-auto mb-3 opacity-90" />
                       <h1 className="text-3xl font-black uppercase tracking-widest leading-none">
                            {isVerified ? 'Authentic Record' : 'Pending Verification'}
                       </h1>
                       <p className="text-white/80 text-sm font-medium mt-2 tracking-widest uppercase">
                            Firstborn Global Ledger Security
                       </p>
                  </div>

                  {/* Body */}
                  <div className="bg-white dark:bg-[#111] rounded-b-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 p-8 sm:p-12 relative">
                       
                       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent opacity-50"></div>

                       {/* Brand Header */}
                       <div className="flex justify-between items-start mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-950 rounded-xl p-3 flex justify-center items-center h-16 w-16">
                                    <School className="text-white w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-indigo-950 dark:text-white uppercase tracking-tight leading-none mb-1">Firstborn</h2>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Academy Office</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt Hash</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-300 font-mono bg-gray-50 dark:bg-[#222] px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">{receipt.receiptId}</p>
                            </div>
                       </div>

                       {/* Record Details */}
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Account</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase">{receipt.student?.name || 'Unknown Node'}</p>
                                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 font-mono mt-1">ID: {receipt.student?.enrollmentNumber || 'N/A'}</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction Timestamp</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                                     {format(new Date(receipt.createdAt), "MMMM do, yyyy")}
                                </p>
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                     {format(new Date(receipt.createdAt), "HH:mm:ss 'UTC'X")}
                                </p>
                            </div>
                       </div>

                       <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-10">
                             <div className="flex justify-between items-center mb-4">
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Protocol Matrix</p>
                                 <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">{receipt.paymentMode}</p>
                             </div>
                             <div className="flex justify-between items-end border-t border-gray-200 dark:border-gray-800 pt-4">
                                 <div>
                                      <p className="text-lg font-bold text-gray-900 dark:text-white uppercase">{receipt.paymentType} Payment</p>
                                      {receipt.transactionId && <p className="text-xs font-mono text-gray-500 mt-1 uppercase">TXN: {receipt.transactionId}</p>}
                                 </div>
                                 <p className="text-3xl font-black text-indigo-950 dark:text-white">{formatCurrency(receipt.amount)}</p>
                             </div>
                       </div>

                       {/* Verification Stamp Panel */}
                       <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                             <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isVerified ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'}`}>
                                      {isVerified ? <CheckCircle className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Network Status</p>
                                      <p className={`text-sm font-black uppercase ${isVerified ? 'text-emerald-600' : 'text-yellow-600'}`}>
                                           {isVerified ? 'Authorized Settlement' : 'Awaiting Settlement'}
                                      </p>
                                  </div>
                             </div>
                             
                             {isVerified && receipt.verifiedBy && (
                                 <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-800 pt-6 sm:pt-0 sm:pl-6">
                                      <p className="font-['Brush_Script_MT',cursive] text-2xl text-blue-900 dark:text-blue-400 opacity-80 -rotate-2 mb-1">
                                           Firstborn Secure
                                      </p>
                                      <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">Countersigned: {receipt.verifiedBy.name}</p>
                                 </div>
                             )}
                       </div>
                  </div>
             </div>
        </div>
    );
}
