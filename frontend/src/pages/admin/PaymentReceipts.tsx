import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Search, CheckCircle, XCircle, Printer, Plus, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { PrintableReceipt } from '@/components/finance/PrintableReceipt';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export default function PaymentReceipts() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    
    // Modal states
    const [isAddOpen, setIsAddOpen] = useState(false);
    
    // Manual Payment State
    const [searchStudent, setSearchStudent] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        studentId: '',
        paymentType: 'Fees',
        amount: '',
        paymentMode: 'Cash',
        method: 'cash',
        remarks: ''
    });

    const printRef = useRef<HTMLDivElement>(null);
    const [activePrintReceipt, setActivePrintReceipt] = useState<any>(null);

    const fetchReceipts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/receipts');
            setReceipts(res.data);
        } catch (error) {
            toast.error("Failed to sync financial ledger.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    // Student Lookup for Manual Entry
    useEffect(() => {
        const fetchStudents = async () => {
             if (searchStudent.length < 2) {
                 setStudents([]);
                 return;
             }
             try {
                 const res = await api.get(`/users/pages?search=${searchStudent}&role=student&limit=5`);
                 setStudents(res.data.users);
             } catch (err) {}
        };
        const timer = setTimeout(fetchStudents, 300);
        return () => clearTimeout(timer);
    }, [searchStudent]);

    const handleCreateCashPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/receipts', formData);
            toast.success("Transaction Securely Recorded.");
            setIsAddOpen(false);
            setFormData({ studentId: '', paymentType: 'Fees', amount: '', paymentMode: 'Cash', method: 'cash', remarks: '' });
            setSearchStudent('');
            fetchReceipts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to execute transaction.");
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/receipts/${id}/verify`, { status, remarks: 'Admin Action' });
            toast.success(`Receipt ${status} Successfully.`);
            fetchReceipts();
        } catch (err) {
            toast.error("Validation failed.");
        }
    };

    const handlePrintPDF = async (receipt: any) => {
        setActivePrintReceipt(receipt);
        setIsExporting(true);
        const toastId = toast.loading("Initializing PDF Secure Engine...");

        // Increased delay to ensure react-qr-code and high-res fonts are fully calculated in the ghost DOM
        setTimeout(async () => {
            if (printRef.current) {
                try {
                    toast.loading("Capturing High-Resolution Buffer...", { id: toastId });
                    
                    const canvas = await html2canvas(printRef.current, { 
                        scale: 2, 
                        useCORS: true, 
                        logging: false,
                        backgroundColor: '#ffffff'
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    
                    toast.loading("Compiling Physical PDF Asset...", { id: toastId });
                    
                    // We map the Canvas (800x1000 pixels) directly onto an A4 PDF bounds
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [800, 1000] });
                    pdf.addImage(imgData, 'PNG', 0, 0, 800, 1000);
                    pdf.save(`${receipt.receiptId}.pdf`);
                    
                    toast.success("PDF Exported Successfully.", { id: toastId });
                } catch (err: any) {
                    console.error("PDF Compilation Error:", err);
                    toast.error(`Export Failed: ${err?.message || "Internal Canvas Error"}`, { id: toastId });
                }
            } else {
                toast.error("Print context missing. Try again.", { id: toastId });
            }
            
            setActivePrintReceipt(null);
            setIsExporting(false);
        }, 1000); 
    };

    return (
        <div className="p-6 lg:p-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center">
                         <Banknote className="mr-3 w-8 h-8 text-emerald-500" />
                         Corporate Ledger
                     </h1>
                     <p className="text-gray-500 text-sm mt-1">Firstborn Global Financial Receipt Matrix System.</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg transition tracking-wide">
                    <Plus className="w-5 h-5 mr-2" /> Record Manual Payment
                </button>
            </div>

            {/* Hidden Ghost Canvas Array used purely for strictly exporting High-Res HTML structures via `react-qr-code` */}
            {activePrintReceipt && (
                 <PrintableReceipt receipt={activePrintReceipt} ref={printRef} />
            )}

            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                          <thead>
                               <tr className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 text-xs font-black text-gray-500 uppercase tracking-widest">
                                   <th className="py-4 px-6">Transaction Hash</th>
                                   <th className="py-4 px-6">Target Client</th>
                                   <th className="py-4 px-6">Type & Amount</th>
                                   <th className="py-4 px-6">Protocol</th>
                                   <th className="py-4 px-6">Status</th>
                                   <th className="py-4 px-6 text-right">Actions</th>
                               </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                               {isLoading ? (
                                   <tr>
                                       <td colSpan={6} className="py-10 text-center text-sm font-bold text-gray-500">Synchronizing Global Arrays...</td>
                                   </tr>
                               ) : receipts.map((r) => (
                                   <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-[#222] transition">
                                       <td className="py-4 px-6">
                                            <div className="font-mono text-xs font-bold bg-gray-100 dark:bg-black px-2 py-1 rounded w-fit border border-gray-200 dark:border-gray-700">
                                                {r.receiptId}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">
                                                {format(new Date(r.createdAt), "MMM dd, yyyy HH:mm")}
                                            </div>
                                       </td>
                                       <td className="py-4 px-6">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white uppercase">{r.student?.name || 'Deleted Node'}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">{r.student?.enrollmentNumber || 'N/A'}</p>
                                       </td>
                                       <td className="py-4 px-6">
                                            <p className="font-black text-lg text-emerald-600">${r.amount}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.paymentType}</p>
                                       </td>
                                       <td className="py-4 px-6">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${r.paymentMode === 'Cash' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {r.method || r.paymentMode}
                                            </span>
                                       </td>
                                       <td className="py-4 px-6">
                                            {r.status === 'Verified' && <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-200 uppercase tracking-widest"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified</span>}
                                            {r.status === 'Pending' && <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full w-fit border border-yellow-200 uppercase tracking-widest"><Search className="w-3.5 h-3.5 mr-1" /> Pending</span>}
                                            {r.status === 'Rejected' && <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full w-fit border border-red-200 uppercase tracking-widest"><XCircle className="w-3.5 h-3.5 mr-1" /> Rejected</span>}
                                       </td>
                                       <td className="py-4 px-6 text-right space-x-2">
                                            {r.status === 'Pending' && (
                                                <button onClick={() => handleUpdateStatus(r._id, 'Verified')} className="text-emerald-600 hover:text-emerald-700 p-2 bg-emerald-50 rounded-full transition" title="Mark Verified">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            {r.status === 'Pending' && (
                                                <button onClick={() => handleUpdateStatus(r._id, 'Rejected')} className="text-red-600 hover:text-red-700 p-2 bg-red-50 rounded-full transition" title="Reject Transaction">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button disabled={isExporting} onClick={() => handlePrintPDF(r)} className="text-indigo-600 hover:text-indigo-700 p-2 bg-indigo-50 rounded-full transition disabled:opacity-50" title="Generate Physical Nodes">
                                                <Printer className="w-5 h-5" />
                                            </button>
                                       </td>
                                   </tr>
                               ))}
                          </tbody>
                     </table>
                </div>
            </div>

            {/* Create Cash Registration Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={handleCreateCashPayment} className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
                         <h2 className="text-xl font-black uppercase tracking-tight mb-6">Register Protocol Transaction</h2>
                         <button type="button" onClick={() => setIsAddOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><XCircle className="w-6 h-6" /></button>
                         
                         <div className="space-y-4">
                             <div className="relative">
                                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target Account Search</label>
                                  <input type="text" value={searchStudent} onChange={e => setSearchStudent(e.target.value)} placeholder="Type name..." className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none" />
                                  {students.length > 0 && !formData.studentId && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                                          {students.map(s => (
                                              <button type="button" key={s._id} onClick={() => { setFormData({...formData, studentId: s._id}); setSearchStudent(s.name); setStudents([]); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm font-bold">
                                                  {s.name} <span className="font-mono text-gray-400 text-xs ml-2">{s.email}</span>
                                              </button>
                                          ))}
                                      </div>
                                  )}
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Type</label>
                                     <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm font-bold outline-none">
                                         <option value="Fees">Standard Fees</option>
                                         <option value="Admission">Admission Registration</option>
                                         <option value="Other">Other Assessment</option>
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount ($)</label>
                                     <input type="number" required min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm font-black font-mono focus:border-indigo-500 outline-none" />
                                 </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction Methodology</label>
                                     <select value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm font-bold outline-none">
                                         <option value="Cash">Physical Cash Check</option>
                                         <option value="Online">Digital Transfer</option>
                                         <option value="Mobile Money">Mobile Money</option>
                                         <option value="UPI">UPI (Paytm/PhonePe)</option>
                                         <option value="Card">Credit/Debit Card</option>
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Specific Gateway / Method</label>
                                     <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm font-bold outline-none">
                                         <option value="cash">Direct Cash</option>
                                         <option value="paytm">Paytm</option>
                                         <option value="phonepay">PhonePe</option>
                                         <option value="mtn_money">MTN Mobile Money</option>
                                         <option value="orange_money">Orange Money</option>
                                         <option value="card">Bank Card</option>
                                         <option value="transfer">Direct Bank Transfer</option>
                                     </select>
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Internal Reference / Remarks</label>
                                 <input type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="Optional parameters..." className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none" />
                             </div>
                         </div>

                         <div className="mt-8 flex justify-end gap-3">
                             <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-3 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition">Cancel</button>
                             <button type="submit" disabled={!formData.studentId || !formData.amount} className="px-5 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 tracking-wider">Authorize Protocol</button>
                         </div>
                    </form>
                </div>
            )}
        </div>
    );
}
