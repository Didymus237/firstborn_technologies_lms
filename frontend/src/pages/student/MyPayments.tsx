import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Printer, CreditCard, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PrintableReceipt } from '@/components/finance/PrintableReceipt';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export default function MyPayments() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);
    const [activePrintReceipt, setActivePrintReceipt] = useState<any>(null);

    const fetchMyReceipts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/receipts/my');
            setReceipts(res.data);
        } catch (error) {
            toast.error("Failed to sync personal financial data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyReceipts();
    }, []);

    const handlePrintPDF = async (receipt: any) => {
        if (receipt.status !== 'Verified') {
             toast.error("Unverified receipts cannot be exported logically. Please contact Administration.");
             return;
        }

        setActivePrintReceipt(receipt);
        setIsExporting(true);
        toast.loading("Generating Secure Physical PDF Asset...");

        setTimeout(async () => {
            if (printRef.current) {
                try {
                    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [800, 1000] });
                    pdf.addImage(imgData, 'PNG', 0, 0, 800, 1000);
                    pdf.save(`${receipt.receiptId}.pdf`);
                    toast.dismiss();
                    toast.success("PDF Downloaded securely.");
                } catch (err) {
                    toast.dismiss();
                    toast.error("PDF Compilation Failed.");
                }
            }
            setActivePrintReceipt(null);
            setIsExporting(false);
        }, 500);
    };

    return (
        <div className="p-6 lg:p-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center">
                         <CreditCard className="mr-3 w-8 h-8 text-blue-500" />
                         My Financial Statements
                     </h1>
                     <p className="text-gray-500 text-sm mt-1">Firstborn Global Financial Receipt Matrix System.</p>
                </div>
            </div>

            {/* Hidden export canvas locally isolated to the student's browser */}
            {activePrintReceipt && (
                 <PrintableReceipt receipt={activePrintReceipt} ref={printRef} />
            )}

            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                          <thead>
                               <tr className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 text-xs font-black text-gray-500 uppercase tracking-widest">
                                   <th className="py-4 px-6">Transaction Hash</th>
                                   <th className="py-4 px-6">Type & Amount</th>
                                   <th className="py-4 px-6">Methodology</th>
                                   <th className="py-4 px-6">Validation Status</th>
                                   <th className="py-4 px-6 text-right">Download</th>
                               </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                               {isLoading ? (
                                   <tr>
                                       <td colSpan={5} className="py-10 text-center text-sm font-bold text-gray-500">Synchronizing Personal Arrays...</td>
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
                                            <p className="font-black text-lg text-emerald-600">${r.amount}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.paymentType}</p>
                                       </td>
                                       <td className="py-4 px-6">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${r.paymentMode === 'Cash' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {r.method || r.paymentMode}
                                            </span>
                                       </td>
                                       <td className="py-4 px-6">
                                            {r.status === 'Verified' ? (
                                                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit border border-emerald-200 uppercase tracking-widest">Verified Target</span>
                                            ) : (
                                                <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full w-fit border border-yellow-200 uppercase tracking-widest">Pending Processing</span>
                                            )}
                                       </td>
                                       <td className="py-4 px-6 text-right space-x-2">
                                            <button 
                                                disabled={isExporting || r.status !== 'Verified'} 
                                                onClick={() => handlePrintPDF(r)} 
                                                className="text-blue-600 hover:text-blue-700 p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition disabled:opacity-30 disabled:hover:bg-blue-50" 
                                                title={r.status === 'Verified' ? "Download Physical Receipt" : "Awaiting School Approval"}
                                            >
                                                {r.status === 'Verified' ? <Printer className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                                            </button>
                                       </td>
                                   </tr>
                               ))}
                               {!isLoading && receipts.length === 0 && (
                                   <tr>
                                       <td colSpan={5} className="py-10 text-center text-sm font-bold text-gray-500">No active financial records logged onto your account natively.</td>
                                   </tr>
                               )}
                          </tbody>
                     </table>
                </div>
            </div>
        </div>
    );
}
