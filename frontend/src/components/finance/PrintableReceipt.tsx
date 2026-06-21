import { forwardRef } from 'react';
import ReactQRCode from 'react-qr-code';
const QRCode: any = (ReactQRCode as any).default || (ReactQRCode as any).QRCode || ReactQRCode;
import { School } from 'lucide-react';

interface ReceiptData {
    receiptId: string;
    student: {
        name: string;
        enrollmentNumber: string;
        department: string;
        email: string;
    };
    paymentType: string;
    amount: number;
    paymentMode: string;
    transactionId?: string;
    status: string;
    createdAt: string;
    verifiedBy?: {
        name: string;
    };
    remarks?: string;
}

interface PrintableReceiptProps {
    receipt: ReceiptData;
}

export const PrintableReceipt = forwardRef<HTMLDivElement, PrintableReceiptProps>(({ receipt }, ref) => {

    // Formatting currency natively
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const isVerified = receipt.status === 'Verified';

    return (
        <div className="absolute top-0 left-[-9999px] overflow-hidden bg-[#ffffff]">
            <div
                ref={ref}
                className="bg-[#ffffff] text-[#000000] flex flex-col items-center px-[40px] py-[50px] relative origin-top-left"
                style={{
                    width: '800px',
                    height: '1000px', // Standardized scalable compact Receipt box
                    fontFamily: "'Inter', sans-serif"
                }}
            >
                {/* Header bounds */}
                <div className="w-full flex justify-between items-center border-b-4 border-[#1e1b4b] pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1e1b4b] rounded-xl p-3 flex justify-center items-center h-[80px] w-[80px]">
                            <School className="text-[#ffffff] w-12 h-12" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#1e1b4b] uppercase tracking-tight leading-none mb-1">Firstborn Academy</h1>
                            <p className="text-sm font-bold text-[#6b7280] uppercase tracking-widest">Office of The Bursar</p>
                            <p className="text-xs text-[#6b7280] mt-1">123 Corporate Campus, Silicon Valley, CA</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-4xl font-black text-[#111827] uppercase">Receipt</h2>
                        <div className="mt-2 bg-[#f3f4f6] rounded-lg px-4 py-2 border border-[#e5e7eb]">
                            <p className="text-sm font-bold text-[#1f2937] font-mono tracking-wider">{receipt.receiptId}</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Header Variables */}
                <div className="w-full grid grid-cols-2 gap-8 mb-10">
                    <div>
                        <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Target Account</p>
                        <p className="text-lg font-black text-[#111827] uppercase">{receipt.student?.name || 'Unknown Student'}</p>
                        <p className="text-sm font-bold text-[#4b5563] font-mono tracking-widest uppercase mt-1">ID: {receipt.student?.enrollmentNumber || 'N/A'}</p>
                        <p className="text-sm text-[#4b5563] mt-1">{receipt.student?.department || 'Department N/A'}</p>
                        <p className="text-sm text-[#4b5563]">{receipt.student?.email || 'No Email Registered'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Date & Time</p>
                        <p className="text-lg font-bold text-[#111827]">{new Date(receipt.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>

                        <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mt-4 mb-1">Payment Method</p>
                        <p className="text-lg font-bold text-[#111827] uppercase">{receipt.paymentMode}</p>
                        {receipt.transactionId && (
                            <p className="text-xs font-mono text-[#6b7280] mt-1">TXN: {receipt.transactionId}</p>
                        )}
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="w-full mb-10 flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-[#111827]">
                                <th className="py-4 px-2 text-xs font-black text-[#9ca3af] uppercase tracking-widest">Description</th>
                                <th className="py-4 px-2 text-xs font-black text-[#9ca3af] uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[#e5e7eb]">
                                <td className="py-6 px-2">
                                    <p className="text-xl font-bold text-[#111827]">{receipt.paymentType} Payment</p>
                                    {receipt.remarks && <p className="text-sm text-[#6b7280] mt-1 uppercase tracking-wider">{receipt.remarks}</p>}
                                </td>
                                <td className="py-6 px-2 text-right">
                                    <p className="text-xl font-black text-[#111827]">{formatCurrency(receipt.amount)}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="w-full flex justify-end mt-6">
                        <div className="w-1/2 bg-[#f9fafb] p-6 rounded-2xl border-2 border-[#f3f4f6] flex items-center justify-between">
                            <span className="text-lg font-bold text-[#9ca3af] uppercase tracking-widest">Total Paid</span>
                            <span className="text-4xl font-black text-[#4f46e5]">{formatCurrency(receipt.amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Secure Verification Block */}
                <div className="w-full mt-auto flex justify-between items-end border-t border-[#e5e7eb] pt-8">

                    {/* Signatures & Admin Name */}
                    <div className="space-y-6">
                        {isVerified ? (
                            <div className="relative">
                                <div className="w-48 h-12 flex items-center justify-center border-b" style={{ borderColor: '#000000' }}>
                                    <span className="font-serif italic text-4xl" style={{ color: '#1e3a8a' }}>
                                        {receipt.verifiedBy?.name ? receipt.verifiedBy.name.split(' ')[0] : 'Admin'} Sign
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-[#111827] uppercase tracking-widest mt-2">{receipt.verifiedBy?.name || 'Authorized Admin'}</p>
                                <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Office of Finance</p>
                            </div>
                        ) : (
                            <div className="py-8">
                                <div className="px-4 py-2 font-black uppercase text-sm rounded-lg shadow-sm" style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', borderWidth: '1px' }}>
                                    ❌ Pending Verification
                                </div>
                            </div>
                        )}
                    </div>

                    {/* The Physical QR Identity */}
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Verification Matrix</p>
                            <p className="text-xs text-[#6b7280] max-w-[150px]">Scan securely or lookup hash internally to validate true authenticity.</p>
                        </div>
                        <div className="bg-[#ffffff] p-3 border-2 border-[#e5e7eb] rounded-2xl shadow-sm">
                            <QRCode
                                value={`https://firstborn.app/verify-receipt/${receipt.receiptId}`}
                                size={90}
                            />
                        </div>
                    </div>
                </div>

                {isVerified && (
                    <div className="absolute right-10 bottom-[200px] w-40 h-40 rounded-full flex items-center justify-center z-0 bg-transparent" style={{ border: '4px solid #15803d' }}>
                        <div className="w-[90%] h-[90%] rounded-full flex items-center justify-center font-black text-center uppercase bg-transparent" style={{ border: '2px solid #15803d', color: '#15803d' }}>
                            <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#ffffff', color: '#166534' }}>VERIFIED<br />AUTHENTIC</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
