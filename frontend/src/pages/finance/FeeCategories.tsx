import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
  Plus, Trash2, ReceiptText, DollarSign, 
  Settings 
} from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { FeeCategory } from "@/types";

export default function FeeCategories() {
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"one-time" | "recurring">("one-time");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/finance/categories");
      setCategories(res.data);
    } catch (e) {
      toast.error("Failed to sync template library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name || !amount) return toast.error("Essential parameters missing");
    setIsSubmitting(true);
    try {
      await api.post("/finance/categories", {
        name,
        description,
        amount: Number(amount),
        type
      });
      toast.success("New Fee Template forged successfully!");
      setIsOpen(false);
      setName("");
      setDescription("");
      setAmount("");
      fetchCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Fault detected in template forge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this template?")) return;
    try {
      await api.delete(`/finance/categories/${id}`);
      toast.success("Template decommissioned successfully");
      fetchCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete template");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center">
             <Settings className="mr-3 w-10 h-10 text-emerald-500" />
             Custom Fee Templates
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Define structural financial components mapping the ecosystem's revenue baseline.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-xl h-12 px-8 font-bold text-base gap-2 rounded-2xl transition-all">
              <Plus className="w-5 h-5" /> Forge New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Forge Financial Base</DialogTitle>
              <DialogDescription>
                Assign strict parameters to a new fee category structurally used for global invoicing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label>Template Name</Label>
                <Input 
                  placeholder="e.g. Tuition Fee Q1" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Manifest Description</Label>
                <Input 
                  placeholder="Structural revenue details..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quantum Value ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="2500" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cycle Protocol</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-Time Lock</SelectItem>
                      <SelectItem value="recurring">Recurring Cycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={isSubmitting} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold">
              {isSubmitting ? "Compiling Template..." : "Execute Global Creation"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="py-20 flex justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <Card className="border-dashed py-20 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <ReceiptText className="w-20 h-20 text-muted-foreground opacity-30" />
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold">Zero Templates Defined</h3>
                <p className="text-muted-foreground">Universal invoicing logic requires establishing a baseline template forged in the database.</p>
              </div>
              <Button onClick={() => setIsOpen(true)} variant="outline" className="rounded-xl px-6">Generate Initial Forge</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Card key={c._id} className="group overflow-hidden border-border hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-xl rounded-3xl">
                <CardHeader className="bg-muted/30 pb-4">
                   <div className="flex justify-between items-start">
                     <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                     </div>
                     <Badge variant={c.type === 'recurring' ? 'secondary' : 'outline'} className="uppercase tracking-widest text-[10px] font-black">
                        {c.type} Protocol
                     </Badge>
                   </div>
                   <CardTitle className="pt-4 text-2xl font-black uppercase tracking-tight">{c.name}</CardTitle>
                   <CardDescription className="line-clamp-2 min-h-[40px]">{c.description || "Experimental financial baseline mapping without explicit metadata."}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                   <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Baseline Value</p>
                        <p className="text-3xl font-black text-emerald-600">
                          ${c.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(c._id)}
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
