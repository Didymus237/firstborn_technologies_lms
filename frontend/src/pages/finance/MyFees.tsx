import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CreditCard, Receipt, Info, Smartphone, Globe, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FeeInvoice } from "@/types";

const REGIONAL_METHODS = {
  India: [
    { id: 'paytm', name: 'Paytm', type: 'UPI/Wallet', icon: Smartphone },
    { id: 'phonepay', name: 'PhonePe', type: 'UPI', icon: Wallet },
    { id: 'stripe', name: 'Debit/Credit Card', type: 'Global Card', icon: Globe },
  ],
  Cameroon: [
    { id: 'mtn_money', name: 'MTN MoMo', type: 'Mobile Money', icon: Smartphone },
    { id: 'orange_money', name: 'Orange Money', type: 'Mobile Money', icon: Wallet },
    { id: 'stripe', name: 'Debit/Credit Card', type: 'Global Card', icon: Globe },
  ],
  Other: [
    { id: 'stripe', name: 'Debit/Credit Card', type: 'Global Card', icon: Globe },
  ]
};

export default function MyFees() {
  const { user } = useAuth();
  const studentCountry = (user as any)?.country || "India"; // Fallback to India as default
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyFees();
  }, []);

  const fetchMyFees = async () => {
    try {
      const { data } = await api.get("/finance/invoices/me");
      setInvoices(data);
    } catch (e) {
      toast.error("Failed to extract personal Ledger natively");
    } finally {
      setLoading(false);
    }
  };

  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Online");
  const [payMethod, setPayMethod] = useState("stripe");
  const [payRef, setPayRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePaymentSubmit = async (invoice: FeeInvoice) => {
    if (!payAmount || Number(payAmount) <= 0) return toast.error("Invalid amount");
    
    setIsSubmitting(true);
    try {
      if (payMode === 'Manual Report') {
        await api.post("/receipts", {
          studentId: (user as any)?._id, // Use authenticated user ID reliably
          paymentType: "Fees",
          amount: Number(payAmount),
          paymentMode: 'Online',
          method: payMethod,
          transactionId: payRef,
          remarks: `Self-report for ${invoice.feeCategory?.name}`
        });
        toast.success("Payment report submitted for verification!");
      } else {
        // Integrated API Payment
        const { data } = await api.post("/payment/initiate", {
          invoiceId: invoice._id,
          amount: Number(payAmount),
          method: payMethod
        });

        if (data.checkoutUrl) {
          toast.success("Redirecting to secure gateway...");
          window.location.href = data.checkoutUrl;
          return;
        }

        if (data.prompt) {
          toast.success(data.prompt);
        }
      }

      setPayInvoiceId(null);
      setPayAmount("");
      setPayRef("");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Payment initiation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-[1000px] mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Personal Ledger Security</h1>
        <p className="text-muted-foreground pt-1">Review active billing states and authorized transaction histories securely.</p>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold">Zero Outstanding Balances</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">There are currently absolutely no invoices structurally generated representing your base account.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {invoices.map((invoice) => {
            const outstanding = invoice.amount - invoice.amountPaid;
            return (
              <Card key={invoice._id} className="overflow-hidden shadow-sm border-border">
                <CardHeader className="bg-muted/10 border-b border-border flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg">{invoice.feeCategory?.name || "Generic Base Module"}</CardTitle>
                    <CardDescription className="pt-1">Academic Lock: {invoice.academicYear} / Class Base: {invoice.class?.name}</CardDescription>
                  </div>
                  <div>
                    {invoice.status === 'paid' && <Badge className="bg-emerald-500 uppercase tracking-widest text-[10px] py-1">Fully Authorized</Badge>}
                    {invoice.status === 'partial' && <Badge variant="secondary" className="text-amber-500 border-amber-500/30 uppercase tracking-widest text-[10px] py-1">Partial Debt</Badge>}
                    {invoice.status === 'pending' && <Badge variant="outline" className="text-rose-500 border-rose-500/30 uppercase tracking-widest text-[10px] py-1">Critical Default</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                    <div className="p-6">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Total Assigned Component</p>
                      <p className="text-2xl font-bold">${invoice.amount.toFixed(2)}</p>
                    </div>
                    <div className="p-6 bg-emerald-500/5">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Cleared Digital Assets</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${invoice.amountPaid.toFixed(2)}</p>
                    </div>
                    <div className="p-6 bg-rose-500/5 flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-rose-600 dark:text-rose-400 font-medium mb-1">Required Active Capital</p>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${outstanding.toFixed(2)}</p>
                      </div>
                      
                      {outstanding > 0 && (
                        <Dialog open={payInvoiceId === invoice._id} onOpenChange={(open) => !open && setPayInvoiceId(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => {
                                setPayInvoiceId(invoice._id);
                                setPayAmount(outstanding.toString());
                              }}
                              className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold"
                            >
                              Pay Now / Report
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Initiate Payment Protocol</DialogTitle>
                              <DialogDescription>
                                Report an online transaction or request a new gateway authorization natively.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Methodology</Label>
                                <Select value={payMode} onValueChange={setPayMode}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Online">Real-time Gateway (API)</SelectItem>
                                    <SelectItem value="Manual Report">Manual Report (Bank/Wire)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Authorized Channel ({studentCountry})</Label>
                                <Select value={payMethod} onValueChange={setPayMethod}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(REGIONAL_METHODS[studentCountry as keyof typeof REGIONAL_METHODS] || REGIONAL_METHODS.Other).map((m) => (
                                      <SelectItem key={m.id} value={m.id}>
                                        <div className="flex items-center gap-2 font-medium">
                                          <m.icon className="w-4 h-4 text-primary" />
                                          <span>{m.name}</span>
                                          <span className="text-[10px] opacity-40">({m.type})</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                    {payMode === 'Manual Report' && <SelectItem value="transfer">External Bank Transfer</SelectItem>}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label>Amount to Clear ($)</Label>
                                <Input 
                                  type="number" 
                                  value={payAmount} 
                                  onChange={(e) => setPayAmount(e.target.value)}
                                  max={outstanding}
                                />
                              </div>
                              {payMode === 'Manual Report' && (
                                <div className="grid gap-2">
                                  <Label>Transaction ID / Reference</Label>
                                  <Input 
                                    placeholder="e.g. TXN123456" 
                                    value={payRef}
                                    onChange={(e) => setPayRef(e.target.value)}
                                  />
                                  <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Insert the unique ID from your payment app.
                                  </p>
                                </div>
                              )}
                            </div>
                            <Button 
                              onClick={() => handlePaymentSubmit(invoice)} 
                              disabled={isSubmitting || (payMode === 'Manual Report' && !payRef)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                            >
                              {isSubmitting ? "Processing Transaction..." : (payMode === 'Manual Report' ? "Confirm & Submit for Audit" : `Pay with ${payMethod.toUpperCase()}`)}
                            </Button>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>

                  {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                    <div className="border-t border-border bg-muted/20 p-6">
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" /> Immutable Transaction Chain
                      </h4>
                      <div className="space-y-3">
                        {invoice.paymentHistory.map((txn, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm p-3 bg-background rounded-md border border-border shadow-sm">
                            <div>
                              <span className="font-semibold text-emerald-500">+${txn.amount.toFixed(2)}</span>
                              <span className="text-muted-foreground ml-3 text-xs uppercase tracking-wider">{txn.method} Node</span>
                            </div>
                            <div className="text-right">
                              <span className="text-muted-foreground">{new Date(txn.paymentDate).toLocaleDateString()}</span>
                              {txn.reference && <span className="ml-3 font-mono text-xs text-primary/80">REF: {txn.reference}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
