import { useState, useEffect, useMemo, useRef } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Building2, CreditCard, DollarSign, Plus, ReceiptText, UserCheck, Search, X, Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrintableReceipt } from '@/components/finance/PrintableReceipt';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FeeInvoice, FeeCategory, Class, academicYear } from "@/types";

export default function FeeCollection() {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [years, setYears] = useState<academicYear[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Bulk Gen State
  const [genClassId, setGenClassId] = useState("");
  const [genYearId, setGenYearId] = useState("");
  const [genCategoryId, setGenCategoryId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [genTargetType, setGenTargetType] = useState<"class" | "student">("class");
  const [genStudentId, setGenStudentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Payment State
  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payReference, setPayReference] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  // Receipt Monitoring State
  const [receiptsOpen, setReceiptsOpen] = useState(false);
  const [activeStudentReceipts, setActiveStudentReceipts] = useState<any[]>([]);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [activePrintReceipt, setActivePrintReceipt] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [invRes, catRes, clsRes, yrRes, stdRes] = await Promise.all([
        api.get("/finance/invoices/all"),
        api.get("/finance/categories"),
        api.get("/classes"),
        api.get("/academic-years"),
        api.get("/users?role=student&limit=0")
      ]);
      setInvoices(invRes.data);
      setCategories(catRes.data);
      setClasses(clsRes.data?.data || clsRes.data?.classes || []);
      const yrList = yrRes.data?.academicYears || yrRes.data?.years || yrRes.data || [];
      setYears(yrList);
      setStudents(stdRes.data?.users || []);
      
      // Auto-select Current Year
      const current = yrList.find((y: any) => y.isCurrent);
      if (current) setGenYearId(current._id);
    } catch (e: any) {
      toast.error("Failed to load Finance Ecosystem universally");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!genYearId) return toast.error("Please lock the Academic Year Cycle first");
    if (!genCategoryId) return toast.error("Please assign a Fee Template Base");
    if (genTargetType === "class" && !genClassId) return toast.error("Target Class Subsystem is missing");
    if (genTargetType === "student" && !genStudentId) return toast.error("Target Individual Student selection is missing");
    if (genTargetType === "student" && !genClassId) return toast.error("Class Context is missing for the selected student");

    setIsGenerating(true);
    try {
      console.log("🚀 Generating Invoices:", {
        strategy: genTargetType,
        year: genYearId,
        category: genCategoryId,
        class: genClassId,
        student: genStudentId
      });

      if (genTargetType === "student") {
        await api.post("/finance/invoices/single", {
          studentId: genStudentId,
          classId: genClassId,
          academicYear: genYearId,
          feeCategoryId: genCategoryId
        });
        toast.success("Targeted invoice generated perfectly!");
      } else {
        const res = await api.post("/finance/invoices/bulk", {
          classId: genClassId,
          academicYear: genYearId,
          feeCategoryId: genCategoryId
        });
        toast.success(res.data?.message || "Bulk invoices generated perfectly!");
      }
      setGeneratorOpen(false);
      fetchDashboardData();
    } catch (e: any) {
      console.error("❌ Generation Error:", e);
      toast.error(e.response?.data?.message || "Generation error: Network or Server Fault");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payAmount || isNaN(Number(payAmount))) return toast.error("Invalid denomination");
    setIsPaying(true);
    try {
      await api.put(`/finance/invoices/${payInvoiceId}/pay`, {
        amount: Number(payAmount),
        method: payMethod,
        reference: payReference
      });
      toast.success("Transaction successfully authorized!");
      setPayInvoiceId(null);
      setPayAmount("");
      setPayReference("");
      fetchDashboardData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Transaction explicitly declined");
    } finally {
      setIsPaying(false);
    }
  };

  const handleFetchReceipts = async (studentId: string, studentName: string) => {
    setSelectedStudentName(studentName);
    setReceiptsOpen(true);
    try {
      const res = await api.get(`/receipts?student=${studentId}`);
      setActiveStudentReceipts(res.data);
    } catch (e: any) {
      toast.error("Failed to retrieve professional receipts");
    }
  };

  const handlePrintPDF = async (receipt: any) => {
    setActivePrintReceipt(receipt);
    setIsExporting(true);
    toast.loading("Compiling Professional PDF Asset...");

    setTimeout(async () => {
      if (printRef.current) {
        try {
          const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, logging: false });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [800, 1000] });
          pdf.addImage(imgData, 'PNG', 0, 0, 800, 1000);
          pdf.save(`${receipt.receiptId}.pdf`);
          toast.dismiss();
          toast.success("Receipt Exported Successfully");
        } catch (err) {
          toast.dismiss();
          toast.error("PDF Compilation Fault");
        }
      }
      setActivePrintReceipt(null);
      setIsExporting(false);
    }, 500);
  };

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    const lower = searchTerm.toLowerCase();
    return invoices.filter(inv => 
      inv.student?.name?.toLowerCase().includes(lower) || 
      inv.class?.name?.toLowerCase().includes(lower) ||
      inv.feeCategory?.name?.toLowerCase().includes(lower)
    );
  }, [invoices, searchTerm]);

  const stats = useMemo(() => {
    const totalExpected = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const outstanding = totalExpected - totalCollected;
    const completionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    return {
      expected: totalExpected.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      collected: totalCollected.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      outstanding: outstanding.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      completionRate: completionRate.toFixed(1)
    };
  }, [invoices]);

  return (
    <div className="p-4 space-y-6 max-w-[1400px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Command Center</h1>
          <p className="text-muted-foreground pt-1">Advanced oversight orchestration mapping total ecosystem revenue and debt obligations globally.</p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 shadow-sm border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
            onClick={() => window.location.href = "/finance/categories"}
          >
            <Settings className="w-4 h-4" /> Manage Templates
          </Button>

          <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700">
                <ReceiptText className="w-4 h-4" /> Issue Bulk Invoices
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate Automated Bills</DialogTitle>
              <DialogDescription>
                Assign strict financial templates structurally to an entire class matrix physically in one explicit click.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Generation Strategy</Label>
                <div className="flex gap-2">
                   <Button 
                      variant={genTargetType === "class" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setGenTargetType("class")}
                   >Class Bulk</Button>
                   <Button 
                      variant={genTargetType === "student" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setGenTargetType("student")}
                   >Individual Student</Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Fee Category Template</Label>
                <Select value={genCategoryId} onValueChange={setGenCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Template Base" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name} (${c.amount})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Academic Year Lock</Label>
                <Select value={genYearId} onValueChange={setGenYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y._id} value={y._id}>{y.name} {y.isCurrent && "(Current)"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {genTargetType === "student" ? (
                <div className="grid gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-2">
                    <Label>Target Individual Student</Label>
                    <Select 
                      value={genStudentId} 
                      onValueChange={(val) => {
                        setGenStudentId(val);
                        const std = students.find(s => s._id === val);
                        if (std?.studentClass?._id) setGenClassId(std.studentClass._id);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Search Student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s._id} value={s._id}>{s.name} ({s.rollNumber || "N/A"})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Confirm Class Context</Label>
                    <Select value={genClassId} onValueChange={setGenClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Record Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 animate-in slide-in-from-top-2 duration-300">
                  <Label>Target Class Subsystem</Label>
                  <Select value={genClassId} onValueChange={setGenClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Target Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button onClick={handleBulkGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? "Processing Matrix..." : "Execute Bulk Generation Cycle"}
            </Button>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* DASHBOARD ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expected}</div>
            <p className="text-xs text-muted-foreground mt-1">Total systemic billing volume</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Liquid Assets Collected</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.collected}</div>
            <p className="text-xs text-primary/80 mt-1">Cash successfully trapped natively</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Debt</CardTitle>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.outstanding}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending student balances globally</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-emerald-500/10 dark:bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Recovery Integrity</CardTitle>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completionRate}%</div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Of total balances resolved</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Active Financial Ledger</CardTitle>
              <CardDescription>Comprehensive tracking matrix mapping all student invoice parameters instantly.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input 
                  placeholder="Search students or records..." 
                  className="pl-9 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left align-middle border-collapse">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-tight text-foreground/80">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student Trajectory</th>
                  <th className="px-6 py-4 font-semibold">Class Base</th>
                  <th className="px-6 py-4 font-semibold">Fee Template</th>
                  <th className="px-6 py-4 font-semibold text-right">Invoice Value</th>
                  <th className="px-6 py-4 font-semibold text-right">Cash Received</th>
                  <th className="px-6 py-4 font-semibold text-center">Status Shield</th>
                  <th className="px-6 py-4 font-semibold text-right">Active Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      Zero generated invoices mapped within the active database matrix structurally.
                    </td>
                  </tr>
                ) : filteredInvoices.map((invoice) => {
                  const outstanding = invoice.amount - invoice.amountPaid;
                  return (
                    <tr key={invoice._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {invoice.student?.name || "Deleted User"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {invoice.class?.name || "Deleted Class"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{invoice.feeCategory?.name || "Deleted Component"}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-500">
                        ${invoice.amountPaid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {invoice.status === 'paid' && <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Paid Complete</Badge>}
                        {invoice.status === 'partial' && <Badge variant="secondary" className="text-amber-500 border-amber-500/30">Partial Lock</Badge>}
                        {invoice.status === 'pending' && <Badge variant="outline" className="text-rose-500 border-rose-500/30">Pending Default</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleFetchReceipts(invoice.student?._id, invoice.student?.name)}
                            >
                              <ReceiptText className="w-4 h-4 mr-1" /> Receipts
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-sm border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                                  disabled={invoice.status === "paid"}
                                  onClick={() => setPayInvoiceId(invoice._id)}
                                >
                                  <Plus className="w-4 h-4 mr-1" /> Log Payment
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Authorize New Payment</DialogTitle>
                                  <DialogDescription>
                                    Insert new raw capital explicitly mapped against {invoice.student?.name}'s debt native structurally to {invoice.feeCategory?.name}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="flex justify-between p-3 bg-muted/30 rounded-lg border border-border">
                                    <span className="text-sm font-medium">Pending Requirement:</span>
                                    <span className="text-sm font-bold text-rose-500">${outstanding.toFixed(2)}</span>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Tender Method</Label>
                                    <Select value={payMethod} onValueChange={setPayMethod}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="cash">Physical Cash Vault</SelectItem>
                                        <SelectItem value="card">Credit / Debit Card</SelectItem>
                                        <SelectItem value="paytm">Paytm Transfer</SelectItem>
                                        <SelectItem value="phonepay">PhonePe Payment</SelectItem>
                                        <SelectItem value="mtn_money">MTN Mobile Money</SelectItem>
                                        <SelectItem value="orange_money">Orange Money</SelectItem>
                                        <SelectItem value="transfer">Digital Bank Wire</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Physical Denomination</Label>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={payAmount}
                                      max={outstanding}
                                      onChange={(e) => setPayAmount(e.target.value)}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Digital Verification Reference (Optional)</Label>
                                    <Input
                                      placeholder="#TXN-88492021"
                                      value={payReference}
                                      onChange={(e) => setPayReference(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <Button onClick={handleRecordPayment} disabled={isPaying} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                                  {isPaying ? "Transmitting..." : "Execute & Verify Clearance"}
                                </Button>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* RECEIPT MONITORING DIALOG */}
      <Dialog open={receiptsOpen} onOpenChange={setReceiptsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Verified Receipts: {selectedStudentName}
            </DialogTitle>
            <DialogDescription>
              Awaiting school verification or successfully trapped assets structurally logged in the ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
             {activeStudentReceipts.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                 Zero professional receipts trapped for this student natively.
               </div>
             ) : (
               activeStudentReceipts.map((r) => (
                 <div key={r._id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border group transition hover:bg-muted/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold bg-background px-2 py-0.5 rounded border border-border">{r.receiptId}</span>
                        <Badge variant={r.status === 'Verified' ? 'default' : 'outline'} className={r.status === 'Verified' ? 'bg-emerald-500' : 'text-amber-500'}>
                          {r.status}
                        </Badge>
                      </div>
                      <p className="font-bold text-lg">${r.amount}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        {r.method} | {format(new Date(r.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isExporting || r.status !== 'Verified'}
                      onClick={() => handlePrintPDF(r)}
                    >
                      <Printer className="w-4 h-4" /> Export Receipt
                    </Button>
                 </div>
               ))
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden export canvas locally isolated to the browser */}
      {activePrintReceipt && (
           <PrintableReceipt receipt={activePrintReceipt} ref={printRef} />
      )}
    </div>
  );
}
