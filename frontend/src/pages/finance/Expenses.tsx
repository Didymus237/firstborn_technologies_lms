import { useState, useEffect, useMemo, useRef } from "react";
import { api, baseURL } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Search,
  Filter,
  Edit2,
  Paperclip,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Sliders,
  DollarSign as IncomeIcon,
  ArrowRight,
  RefreshCw,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import type { Expense, Budget, ExpenseStats, ExpenseCategory, ExpenseStatus, ExpenseApprovalStatus } from "@/types";

// Classy brand-inspired color scheme
const BRAND_COLORS = {
  crimson: "#8B1E1E",
  gold: "#C5A03A",
  mutedCrimson: "rgba(139, 30, 30, 0.4)",
  mutedGold: "rgba(197, 160, 58, 0.4)",
  slate: "#64748B",
  indigo: "#6366F1",
  emerald: "#10B981",
  rose: "#F43F5E",
  amber: "#F59E0B"
};

const PIE_COLORS = [
  BRAND_COLORS.crimson,
  BRAND_COLORS.gold,
  BRAND_COLORS.indigo,
  BRAND_COLORS.emerald,
  BRAND_COLORS.slate,
  BRAND_COLORS.rose,
  BRAND_COLORS.amber,
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#3B82F6"  // blue
];

const CATEGORIES: ExpenseCategory[] = [
  "Salaries & Wages",
  "Rent",
  "Utilities",
  "Marketing",
  "Travel",
  "Office Supplies",
  "Software Subscriptions",
  "Maintenance",
  "Taxes",
  "Insurance",
  "Student Services",
  "Operational Costs",
  "Miscellaneous"
];

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Card",
  "Mobile Money",
  "Orange Money",
  "Bank Transfer"
];

export default function ExpensesManagementPage() {
  const { user, year } = useAuth();
  const isAdmin = user?.role === "admin";

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "ledger" | "budgets" | "alerts">("overview");

  // Financial Stats & Budgets State
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterApproval, setFilterApproval] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create Expense Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Salaries & Wages" as ExpenseCategory,
    description: "",
    vendor: "",
    paymentMethod: "Cash",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    status: "Pending" as ExpenseStatus,
    isRecurring: false,
    attachmentUrl: ""
  });

  // Edit/Approve Expense Modal State
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingExpense, setUpdatingExpense] = useState(false);
  const [auditComment, setAuditComment] = useState("");

  // Budget Modal State
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [submittingBudget, setSubmittingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "Salaries & Wages" as ExpenseCategory,
    monthlyLimit: "",
    yearlyLimit: ""
  });

  // Refresh data trigger
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    fetchBudgets();
  }, [refreshKey]);

  // Fetch expenses with active filter/sorting/pagination
  useEffect(() => {
    fetchExpenses();
  }, [
    page,
    filterCategory,
    filterStatus,
    filterApproval,
    filterMethod,
    dateStart,
    dateEnd,
    sortField,
    sortOrder,
    refreshKey
  ]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchExpenses();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/expenses/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to load financial statistics.");
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/expenses/budgets");
      setBudgets(res.data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      toast.error("Failed to load category budgets.");
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortField,
        sortOrder,
        search: searchTerm || undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        approvalStatus: filterApproval !== "all" ? filterApproval : undefined,
        paymentMethod: filterMethod !== "all" ? filterMethod : undefined,
        dateStart: dateStart || undefined,
        dateEnd: dateEnd || undefined
      };

      const res = await api.get("/expenses", { params });
      setExpenses(res.data.expenses);
      setTotalPages(res.data.pagination.pages);
      setTotalCount(res.data.pagination.total);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      toast.error("Failed to load active financial ledger.");
    } finally {
      setLoading(false);
    }
  };

  // File Upload handler for Expense Receipt
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const uploadToast = toast.loading("Uploading receipt document...");
    try {
      const res = await api.post("/upload/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setNewExpense(prev => ({ ...prev, attachmentUrl: res.data.url }));
      toast.success("Receipt uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "File upload failed");
    } finally {
      toast.dismiss(uploadToast);
    }
  };

  // Submit new expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.vendor || !newExpense.amount) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmittingExpense(true);
    try {
      await api.post("/expenses/create", {
        ...newExpense,
        amount: Number(newExpense.amount)
      });
      toast.success("Expense submitted successfully!");
      setIsCreateOpen(false);
      // Reset form
      setNewExpense({
        category: "Salaries & Wages",
        description: "",
        vendor: "",
        paymentMethod: "Cash",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        status: "Pending",
        isRecurring: false,
        attachmentUrl: ""
      });
      setRefreshKey(p => p + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit expense.");
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Update expense status / approval
  const handleUpdateApproval = async (status: ExpenseApprovalStatus) => {
    if (!selectedExpense) return;
    setUpdatingExpense(true);
    try {
      const payload: any = {
        approvalStatus: status,
        comment: auditComment.trim() || undefined
      };

      // Automatically sync payment status if marked as paid
      if (status === "Paid") {
        payload.status = "Paid";
      } else if (status === "Rejected") {
        payload.status = "Overdue"; // Or keep current
      }

      const res = await api.put(`/expenses/update/${selectedExpense._id}`, payload);
      toast.success(`Expense successfully updated to: ${status}`);
      setIsDetailsOpen(false);
      setSelectedExpense(null);
      setAuditComment("");
      setRefreshKey(p => p + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update approval stage.");
    } finally {
      setUpdatingExpense(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this expense?")) return;
    try {
      await api.delete(`/expenses/delete/${id}`);
      toast.success("Expense deleted successfully.");
      setRefreshKey(p => p + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete expense.");
    }
  };

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Approve all ${selectedIds.length} selected expenses?`)) return;

    const toastId = toast.loading("Processing bulk approvals...");
    try {
      await Promise.all(
        selectedIds.map(id => api.put(`/expenses/update/${id}`, { approvalStatus: "Approved" }))
      );
      toast.success("Bulk approvals complete.");
      setSelectedIds([]);
      setRefreshKey(p => p + 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve some expenses.");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete all ${selectedIds.length} selected expenses?`)) return;

    const toastId = toast.loading("Processing bulk deletions...");
    try {
      await Promise.all(
        selectedIds.map(id => api.delete(`/expenses/delete/${id}`))
      );
      toast.success("Bulk deletion complete.");
      setSelectedIds([]);
      setRefreshKey(p => p + 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete some expenses.");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Upsert Budget limits
  const handleUpsertBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year) {
      toast.error("Active Academic Year context is missing.");
      return;
    }
    if (!newBudget.monthlyLimit || !newBudget.yearlyLimit) {
      toast.error("Please insert limits.");
      return;
    }

    setSubmittingBudget(true);
    try {
      await api.post("/expenses/budgets/create", {
        category: newBudget.category,
        monthlyLimit: Number(newBudget.monthlyLimit),
        yearlyLimit: Number(newBudget.yearlyLimit),
        academicYearId: year._id
      });
      toast.success("Budget limit configured perfectly!");
      setIsBudgetOpen(false);
      setNewBudget({
        category: "Salaries & Wages",
        monthlyLimit: "",
        yearlyLimit: ""
      });
      setRefreshKey(p => p + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to configure budget limits.");
    } finally {
      setSubmittingBudget(false);
    }
  };

  // Checkbox toggle
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map(e => e._id));
    }
  };

  // PDF Export of Everything (Full Financial Report)
  const handleExportPDF = () => {
    if (!stats || !stats.summary) {
      return toast.error("Financial analytics not loaded yet.");
    }
    if (expenses.length === 0) {
      return toast.info("No records to export.");
    }
    
    // Landscape A4 sheet (297mm x 210mm)
    const doc = new jsPDF("l", "mm", "a4");

    // PAGE 1: EXECUTIVE FINANCE SUMMARY
    // ----------------------------------------------------
    // Brand header
    doc.setFontSize(24);
    doc.setTextColor(139, 30, 30); // Crimson #8B1E1E
    doc.setFont("helvetica", "bold");
    doc.text("Firstborn Technologies", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(197, 160, 58); // Gold #C5A03A
    doc.text("EXECUTIVE FINANCIAL REPORT & AUDIT", 14, 27);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`Academic Session: ${year?.name || "N/A"}  |  Report Generated: ${format(new Date(), "PPP hh:mm a")}`, 14, 33);

    // Section 1: Core Financial Indicators
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("1. Core Performance Metrics", 14, 42);

    // Financial KPI table
    const kpiHead = [["Financial Metric", "Value (INR)", "Operational Description"]];
    const kpiBody = [
      ["Total Inflow (Verified Income)", `₹${stats.summary.totalIncome.toLocaleString()}`, "Total student fees successfully collected and verified."],
      ["Total Outflow (Settled Expenses)", `₹${stats.summary.totalExpenses.toLocaleString()}`, "Capital spent on administrative costs, salaries, etc."],
      ["Net Liquid Balance", `₹${stats.summary.netBalance.toLocaleString()}`, "Available liquid cash flow (Inflow - Settled Outflow)."],
      ["Outstanding Debt (Expected Inflows)", `₹${stats.summary.outstandingPayments.toLocaleString()}`, "Unpaid student fee balances currently outstanding."],
      ["Pending Claims (Unapproved Expenses)", `₹${stats.summary.pendingExpenses.toLocaleString()}`, "Submitted expense claims awaiting verification."],
      ["Net Available Balance", `₹${stats.summary.availableBalance.toLocaleString()}`, "Net Balance accounting for expected pending payouts."],
      ["Projected Balance", `₹${stats.summary.projectedBalance.toLocaleString()}`, "Estimated year-end matrix including outstanding receivables."],
      ["Profit/Loss Margin", `${stats.summary.profitMargin}%`, "Ecosystem operating profit margin percentage."]
    ];

    autoTable(doc, {
      startY: 45,
      head: kpiHead,
      body: kpiBody,
      theme: "grid",
      styles: { fontSize: 8.5, cellPadding: 2 },
      headStyles: { fillColor: [139, 30, 30], textColor: [255, 255, 255] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { fontStyle: "bold", cellWidth: 40 },
        2: { cellWidth: 165 }
      }
    });

    // Section 2: Budget Allocations
    const nextY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("2. Departmental Budget Allocations", 14, nextY);

    const budgetHead = [["Category", "Monthly Limit", "MTD Spent", "Remaining Cap", "Utilization %"]];
    const budgetBody = budgets.map(b => [
      b.category,
      `₹${b.monthlyLimit.toLocaleString()}`,
      `₹${b.spent.toLocaleString()}`,
      `₹${b.remaining.toLocaleString()}`,
      `${b.utilizationPercent}%`
    ]);

    autoTable(doc, {
      startY: nextY + 3,
      head: budgetHead,
      body: budgetBody,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [197, 160, 58], textColor: [255, 255, 255] },
      columnStyles: {
        0: { fontStyle: "bold" }
      }
    });

    // PAGE 2: ACTIVE TRANSACTION LEDGER
    // ----------------------------------------------------
    doc.addPage();
    
    doc.setFontSize(16);
    doc.setTextColor(139, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text("3. Active Transaction Ledger", 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`List of all matching expenditures  |  Total entries: ${expenses.length}`, 14, 25);

    const ledgerHead = [["Expense ID", "Category", "Description", "Vendor", "Payment Method", "Amount", "Date", "Status", "Approval"]];
    const ledgerBody = expenses.map(e => [
      e.expenseId,
      e.category,
      e.description,
      e.vendor,
      e.paymentMethod,
      `₹${e.amount.toLocaleString()}`,
      format(new Date(e.date), "yyyy-MM-dd"),
      e.status,
      e.approvalStatus
    ]);

    autoTable(doc, {
      startY: 29,
      head: ledgerHead,
      body: ledgerBody,
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        valign: "middle"
      },
      headStyles: {
        fillColor: [139, 30, 30],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });

    // Page Numbers Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${format(new Date(), "PPP")} - Page ${i} of ${pageCount} | Firstborn Technologies Finance`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    doc.save(`Full_Financial_Report_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`);
    toast.success("Comprehensive Financial PDF exported successfully!");
  };

  // CSV Export
  const handleExportCSV = () => {
    if (expenses.length === 0) return toast.info("No records to export.");
    const headers = ["Expense ID", "Category", "Description", "Vendor", "Payment Method", "Amount", "Date", "Status", "Approval Status", "Created By"];
    const rows = expenses.map(e => [
      e.expenseId,
      `"${e.category.replace(/"/g, '""')}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.vendor.replace(/"/g, '""')}"`,
      e.paymentMethod,
      e.amount,
      format(new Date(e.date), "yyyy-MM-dd"),
      e.status,
      e.approvalStatus,
      `"${(e.createdBy?.name || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Financial_Ledger_${format(new Date(), "yyyyMMdd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterApproval("all");
    setFilterMethod("all");
    setDateStart("");
    setDateEnd("");
    setPage(1);
    toast.success("Filters cleared.");
  };

  // Computed alert items dynamically from the retrieved data context
  const generatedAlerts = useMemo(() => {
    const alertsList: Array<{ id: string; type: "critical" | "warning" | "info"; title: string; message: string; date: string }> = [];

    // 1. Budget Overruns
    budgets.forEach(b => {
      if (b.spent > b.monthlyLimit) {
        alertsList.push({
          id: `budget-over-${b.category}`,
          type: "critical",
          title: "Budget Overrun Detected",
          message: `${b.category} category spent ₹${b.spent.toLocaleString()} exceeding the monthly limit of ₹${b.monthlyLimit.toLocaleString()} by ₹${(b.spent - b.monthlyLimit).toLocaleString()}.`,
          date: format(new Date(), "hh:mm a")
        });
      } else if (b.spent > b.monthlyLimit * 0.8) {
        alertsList.push({
          id: `budget-warn-${b.category}`,
          type: "warning",
          title: "Budget Exhaustion Approaching",
          message: `${b.category} spending is at ${b.utilizationPercent}% of its monthly cap (₹${b.spent.toLocaleString()} out of ₹${b.monthlyLimit.toLocaleString()}).`,
          date: format(new Date(), "hh:mm a")
        });
      }
    });

    // 2. Large Transactions & Pending Reviews
    expenses.forEach(e => {
      if (e.amount > 50000) {
        alertsList.push({
          id: `large-txn-${e._id}`,
          type: "info",
          title: "High-Value Capital Outlay",
          message: `Expense ${e.expenseId} (₹${e.amount.toLocaleString()}) for "${e.description}" is flagged for high value.`,
          date: format(new Date(e.createdAt), "MMM dd, hh:mm a")
        });
      }
      if (e.approvalStatus === "Submitted") {
        alertsList.push({
          id: `pending-approve-${e._id}`,
          type: "warning",
          title: "Awaiting Administrative Review",
          message: `Expense ${e.expenseId} from ${e.createdBy?.name || "Staff"} requires verification.`,
          date: format(new Date(e.createdAt), "MMM dd, hh:mm a")
        });
      }
      if (e.status === "Overdue") {
        alertsList.push({
          id: `overdue-${e._id}`,
          type: "critical",
          title: "Overdue Financial Obligation",
          message: `Expense ${e.expenseId} to "${e.vendor}" has passed its expected payout date.`,
          date: format(new Date(e.date), "MMM dd")
        });
      }
    });

    return alertsList;
  }, [budgets, expenses]);

  // Recharts Custom Tooltip (Frosted Glass)
  const RechartsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-3 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-lg space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          {label && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>}
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-muted-foreground font-medium">{entry.name}:</span>
              <span className="text-foreground font-bold">₹{entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-6 max-w-[1400px] mx-auto animate-in fade-in zoom-in-95 duration-500 relative">
      {/* Visual Backdrop Layers */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B1E1E]/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#C5A03A]/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 tracking-wide uppercase">
              Financial Center
            </span>
            {year && (
              <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                Cycle: {year.name}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1.5">
            Expenses & Financial Operations
          </h1>
          <p className="text-muted-foreground text-sm pt-0.5">
            Ecosystem dashboard tracking school budgets, capital outflows, and student fee revenues.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => setIsBudgetOpen(true)}
              className="flex-1 md:flex-none gap-2 shadow-sm border-[#C5A03A]/30 text-[#C5A03A] hover:bg-[#C5A03A]/5 rounded-xl font-semibold transition-all duration-300"
            >
              <Sliders className="w-4 h-4" /> Manage Budgets
            </Button>
          )}

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 md:flex-none gap-2 shadow-md bg-gradient-to-r from-[#8B1E1E] to-[#b02e2e] hover:from-[#a12323] hover:to-[#c53a3a] text-white rounded-xl font-semibold transition-all duration-300 border-none"
          >
            <Plus className="w-4 h-4" /> New Expense
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRefreshKey(p => p + 1)}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            title="Refresh System"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Real-time Indicator Tabs */}
      <div className="flex border-b border-zinc-200/50 dark:border-zinc-800/50 p-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "overview"
              ? "bg-white dark:bg-zinc-950 shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Operations Overview
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "ledger"
              ? "bg-white dark:bg-zinc-950 shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Financial Ledger
        </button>
        <button
          onClick={() => setActiveTab("budgets")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "budgets"
              ? "bg-white dark:bg-zinc-950 shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="w-4 h-4" /> Category Budgets
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all relative ${
            activeTab === "alerts"
              ? "bg-white dark:bg-zinc-950 shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Alert System
          {generatedAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* TAB 1: OPERATIONS OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* STATS MATRIX CARDS */}
          {stats?.summary ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Card 1: Total Income */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Income</CardTitle>
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500"><IncomeIcon className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-foreground">₹{stats.summary.totalIncome.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Sum of verified receipts</p>
                </CardContent>
              </Card>

              {/* Card 2: Total Expenses */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#8B1E1E] to-[#b02e2e]" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Expenses</CardTitle>
                  <div className="p-1 rounded-lg bg-[#8B1E1E]/10 text-[#8B1E1E]"><CreditCard className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-foreground">₹{stats.summary.totalExpenses.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Settled/Paid outflows</p>
                </CardContent>
              </Card>

              {/* Card 3: Net Balance */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-[#C5A03A]" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Net Balance</CardTitle>
                  <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500"><TrendingUp className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className={`text-xl font-black ${stats.summary.netBalance >= 0 ? "text-foreground" : "text-rose-500"}`}>
                    ₹{stats.summary.netBalance.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Liquid cash remaining</p>
                </CardContent>
              </Card>

              {/* Card 4: Outstanding Inflow */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-500 to-[#C5A03A]" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Outstanding Inflow</CardTitle>
                  <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500"><ArrowUpRight className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-amber-500">₹{stats.summary.outstandingPayments.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Expected course balances</p>
                </CardContent>
              </Card>

              {/* Card 5: Pending Outflow */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-violet-500 to-indigo-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Outflow</CardTitle>
                  <div className="p-1 rounded-lg bg-violet-500/10 text-violet-500"><ArrowDownRight className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-violet-500">₹{stats.summary.pendingExpenses.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting verification</p>
                </CardContent>
              </Card>

              {/* Card 6: Available Balance */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-500 to-blue-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Balance</CardTitle>
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500"><Wallet className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-foreground">₹{stats.summary.availableBalance.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Net balance minus pending outlays</p>
                </CardContent>
              </Card>

              {/* Card 7: Projected Balance */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-cyan-500 to-[#C5A03A]" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projected Balance</CardTitle>
                  <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-500"><TrendingUp className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-foreground">₹{stats.summary.projectedBalance.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Estimated year-end matrix</p>
                </CardContent>
              </Card>

              {/* Card 8: Monthly Revenue */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-lime-500 to-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Revenue</CardTitle>
                  <div className={`p-1 rounded-lg flex items-center gap-0.5 text-xs font-extrabold ${stats.summary.monthlyRevenueChange >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                    {stats.summary.monthlyRevenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{Math.abs(stats.summary.monthlyRevenueChange)}%</span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-foreground">₹{stats.summary.currentMonthRevenue.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Monthly inflows</p>
                </CardContent>
              </Card>

              {/* Card 9: Monthly Expenses */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#8B1E1E] to-rose-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Expenses</CardTitle>
                  <div className={`p-1 rounded-lg flex items-center gap-0.5 text-xs font-extrabold ${stats.summary.monthlyExpensesChange <= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                    {stats.summary.monthlyExpensesChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    <span>{Math.abs(stats.summary.monthlyExpensesChange)}%</span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-foreground">₹{stats.summary.currentMonthExpenses.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Monthly outflows</p>
                </CardContent>
              </Card>

              {/* Card 10: Profit/Loss Margin */}
              <Card className={`bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group ${stats.summary.profitMargin >= 25 ? "bg-emerald-500/5" : "bg-amber-500/5"}`}>
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 to-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-4 px-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">P/L Summary</CardTitle>
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500"><TrendingUp className="h-3.5 w-3.5" /></div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xl font-black text-foreground">{stats.summary.profitMargin}%</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {stats.summary.profitMargin >= 30 ? "Healthy Operating Margin" : stats.summary.profitMargin >= 10 ? "Satisfactory Margin" : "Narrow Margin"}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* VISUAL CHARTS SECTION */}
          {stats ? (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
              {/* Chart 1: Cash Flow Inflow vs Outflow vs Net (Area Chart) */}
              <Card className="lg:col-span-4 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold text-foreground">6-Month Cash Flow Analytics</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Rolling monthly revenue inflows vs settled expenses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] pr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.cashFlowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BRAND_COLORS.emerald} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={BRAND_COLORS.emerald} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BRAND_COLORS.crimson} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={BRAND_COLORS.crimson} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                      <Tooltip content={<RechartsTooltip />} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="inflow" stroke={BRAND_COLORS.emerald} strokeWidth={2.5} fillOpacity={1} fill="url(#colorInflow)" name="Inflow (Student Fees)" />
                      <Area type="monotone" dataKey="outflow" stroke={BRAND_COLORS.crimson} strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutflow)" name="Outflow (Expenses)" />
                      <Line type="monotone" dataKey="net" stroke={BRAND_COLORS.gold} strokeWidth={2} dot={true} name="Net Cash Flow" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 2: Expense Category Distribution (Pie Chart) */}
              <Card className="lg:col-span-3 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base font-extrabold text-foreground">Expense Distribution</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Allocation of capital across spending channels</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center relative">
                  {stats.categoryDistribution.length > 0 ? (
                    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between">
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip content={<RechartsTooltip />} />
                            <Pie
                              data={stats.categoryDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {stats.categoryDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Customized Legends */}
                      <div className="w-1/2 flex flex-col gap-1.5 overflow-y-auto max-h-[220px] pr-2 text-xs font-semibold">
                        {stats.categoryDistribution.slice(0, 7).map((entry, index) => (
                          <div key={entry.name} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                              <span className="truncate text-muted-foreground">{entry.name}</span>
                            </div>
                            <span className="text-foreground text-right">{entry.percent}%</span>
                          </div>
                        ))}
                        {stats.categoryDistribution.length > 7 && (
                          <p className="text-[10px] text-muted-foreground text-center font-bold italic">+{stats.categoryDistribution.length - 7} other categories</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm font-semibold">No paid expense data registered yet.</div>
                  )}
                </CardContent>
              </Card>

              {/* Chart 3: Revenue vs Expenses comparison (Bar Chart) & Comparison matrix */}
              <Card className="lg:col-span-7 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-extrabold text-foreground">Revenue vs settled outflows</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Monthly side-by-side comparison of school performance</CardDescription>
                  </div>
                  <div className="text-xs font-extrabold text-muted-foreground flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Revenue</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#8B1E1E]" /> Expenses</span>
                  </div>
                </CardHeader>
                <CardContent className="h-[240px] pr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.cashFlowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                      <Tooltip content={<RechartsTooltip />} />
                      <Bar dataKey="inflow" fill={BRAND_COLORS.emerald} radius={[4, 4, 0, 0]} name="Inflow" />
                      <Bar dataKey="outflow" fill={BRAND_COLORS.crimson} radius={[4, 4, 0, 0]} name="Outflow" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: FINANCIAL LEDGER */}
      {activeTab === "ledger" && (
        <Card className="shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Active Financial Ledger</CardTitle>
                <CardDescription className="text-xs">Audit database of all capital expense requests and claims.</CardDescription>
              </div>

              {/* Exports Tooltip */}
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="flex-1 md:flex-none gap-1.5 shadow-xs text-xs font-semibold rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" /> CSV Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="flex-1 md:flex-none gap-1.5 shadow-xs text-xs font-semibold rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" /> PDF Ledger
                </Button>
              </div>
            </div>

            {/* Filters grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
              {/* Search */}
              <div className="relative col-span-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search ID, desc, vendor..."
                  className="pl-8 text-xs h-9 bg-background rounded-lg border-zinc-200/50 dark:border-zinc-800/50"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 text-xs rounded-lg bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-xs rounded-lg bg-background">
                  <SelectValue placeholder="All Payout Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payout Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              {/* Approval */}
              <Select value={filterApproval} onValueChange={setFilterApproval}>
                <SelectTrigger className="h-9 text-xs rounded-lg bg-background">
                  <SelectValue placeholder="All Approvals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approvals</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 text-xs rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold border border-transparent hover:border-rose-500/20"
              >
                Clear Filters
              </Button>
            </div>
          </CardHeader>

          {/* Bulk actions status panel */}
          {selectedIds.length > 0 && isAdmin && (
            <div className="bg-amber-500/10 dark:bg-amber-500/5 px-4 py-2 border-b border-amber-500/20 flex justify-between items-center animate-in slide-in-from-top-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {selectedIds.length} items selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold px-2.5 py-1"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Approve Selected
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold px-2.5 py-1"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1 inline" /> Delete Selected
                </Button>
                <button onClick={() => setSelectedIds([])} className="text-muted-foreground hover:text-foreground text-xs font-bold ml-2">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <table className="w-full text-xs text-left align-middle border-collapse">
                <thead className="bg-zinc-50 dark:bg-zinc-950/30 border-b border-zinc-200/50 dark:border-zinc-800/50 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {isAdmin && (
                      <th className="px-4 py-3 text-center w-8">
                        <input
                          type="checkbox"
                          checked={expenses.length > 0 && selectedIds.length === expenses.length}
                          onChange={toggleSelectAll}
                          className="rounded border-zinc-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3">Expense ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Vendor / Payout</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-center">Payout</th>
                    <th className="px-4 py-3 text-center">Approval</th>
                    <th className="px-4 py-3 text-center">Receipt</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50 bg-card">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 10} className="text-center py-12 text-muted-foreground font-semibold">
                        No financial outlays match the active criteria.
                      </td>
                    </tr>
                  ) : (
                    expenses.map(e => {
                      const isSelected = selectedIds.includes(e._id);
                      return (
                        <tr
                          key={e._id}
                          className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors ${
                            isSelected ? "bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/5" : ""
                          }`}
                        >
                          {isAdmin && (
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(e._id)}
                                className="rounded border-zinc-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="px-4 py-3 font-mono font-bold text-muted-foreground uppercase">{e.expenseId}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-foreground">{e.category}</span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground" title={e.description}>
                            {e.description}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">{e.vendor}</div>
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                              {e.paymentMethod}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-foreground">
                            ₹{e.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-semibold">
                            {format(new Date(e.date), "MMM dd, yyyy")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {e.status === "Paid" && (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none font-bold">Settled</Badge>
                            )}
                            {e.status === "Pending" && (
                              <Badge variant="outline" className="text-amber-500 border-amber-500/30 font-bold bg-amber-500/5">
                                Pending
                              </Badge>
                            )}
                            {e.status === "Overdue" && (
                              <Badge variant="destructive" className="font-bold">Overdue</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {e.approvalStatus === "Paid" && (
                              <Badge className="bg-emerald-600 font-bold text-[10px]">Cleared</Badge>
                            )}
                            {e.approvalStatus === "Approved" && (
                              <Badge className="bg-blue-600 font-bold text-[10px]">Approved</Badge>
                            )}
                            {e.approvalStatus === "Submitted" && (
                              <Badge className="bg-zinc-500 font-bold text-[10px]">Submitted</Badge>
                            )}
                            {e.approvalStatus === "Under Review" && (
                              <Badge className="bg-amber-500 font-bold text-[10px]">Reviewing</Badge>
                            )}
                            {e.approvalStatus === "Rejected" && (
                              <Badge className="bg-rose-600 font-bold text-[10px]">Rejected</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {e.attachmentUrl ? (
                              <a
                                href={`${baseURL}${e.attachmentUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-600 font-bold flex items-center justify-center gap-0.5"
                              >
                                <Paperclip className="w-3.5 h-3.5" /> View
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-[10px] font-bold">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedExpense(e);
                                  setIsDetailsOpen(true);
                                }}
                                className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold text-[10px] px-2 py-1 rounded-lg"
                              >
                                Audit / Details
                              </Button>

                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteExpense(e._id)}
                                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-[10px] px-2 py-1 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200/50 dark:border-zinc-800/50 p-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Showing Page {page} of {totalPages} ({totalCount} total entries)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-lg h-8 text-xs font-semibold px-3"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-lg h-8 text-xs font-semibold px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: CATEGORY BUDGETS */}
      {activeTab === "budgets" && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Category Spend Allocations</h2>
                <p className="text-xs text-muted-foreground">Monthly spending targets and utilization indicators.</p>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => setIsBudgetOpen(true)}
                  className="gap-2 bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A] text-white hover:from-[#761818] hover:to-[#a8882e] border-none font-bold rounded-xl"
                >
                  Configure Allocation
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground font-semibold bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed rounded-xl">
                  No budgets configured for this academic cycle. Click allocation to start.
                </div>
              ) : (
                budgets.map(b => {
                  const percent = b.utilizationPercent;
                  let colorClass = "bg-emerald-500";
                  let borderClass = "border-zinc-200/50 dark:border-zinc-800/50";
                  let bgCardClass = "bg-white dark:bg-zinc-900";
                  
                  if (percent >= 100) {
                    colorClass = "bg-rose-500 animate-pulse";
                    borderClass = "border-rose-500/30 dark:border-rose-500/20";
                    bgCardClass = "bg-rose-500/5";
                  } else if (percent >= 80) {
                    colorClass = "bg-amber-500";
                    borderClass = "border-amber-500/30 dark:border-amber-500/20";
                    bgCardClass = "bg-amber-500/5";
                  }

                  return (
                    <Card key={b._id} className={`border rounded-xl shadow-xs transition-all hover:scale-[1.01] overflow-hidden ${borderClass} ${bgCardClass}`}>
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm font-extrabold truncate max-w-[70%]">{b.category}</CardTitle>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            percent >= 100 ? "bg-rose-500/20 text-rose-500" : percent >= 80 ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
                          }`}>
                            {percent}% Limit
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.min(100, percent)}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground font-semibold uppercase">
                            <span>Spent: ₹{b.spent.toLocaleString()}</span>
                            <span>Limit: ₹{b.monthlyLimit.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Additional stats */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs font-semibold">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Remaining Cap</p>
                            <p className={`font-bold ${b.remaining > 0 ? "text-foreground" : "text-rose-500 font-extrabold animate-pulse"}`}>
                              ₹{b.remaining.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Yearly Limit</p>
                            <p className="text-foreground font-bold">₹{b.yearlyLimit.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: ALERT SYSTEM */}
      {activeTab === "alerts" && (
        <Card className="shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg font-bold">System Alerts & Audits</CardTitle>
            <CardDescription className="text-xs">Real-time warning center highlighting financial overruns and transaction markers.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-3 max-h-[600px] overflow-y-auto">
            {generatedAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-semibold bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed rounded-xl">
                All financial channels are functioning within standard bounds. Zero active alerts.
              </div>
            ) : (
              generatedAlerts.map(a => {
                let statusColorClass = "border-blue-500/20 bg-blue-500/5 text-blue-500";
                let iconClass = <CheckCircle className="w-5 h-5" />;

                if (a.type === "critical") {
                  statusColorClass = "border-rose-500/30 bg-rose-500/5 text-rose-500";
                  iconClass = <AlertCircle className="w-5 h-5" />;
                } else if (a.type === "warning") {
                  statusColorClass = "border-amber-500/30 bg-amber-500/5 text-amber-500";
                  iconClass = <AlertTriangle className="w-5 h-5 animate-pulse" />;
                }

                return (
                  <div key={a.id} className={`flex items-start gap-4 p-4 border rounded-xl transition hover:shadow-xs ${statusColorClass}`}>
                    <div className="shrink-0 mt-0.5">{iconClass}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-extrabold uppercase tracking-wide">{a.title}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground font-mono">{a.date}</span>
                      </div>
                      <p className="text-xs text-foreground/80 font-medium mt-1 leading-relaxed">{a.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: CREATE EXPENSE */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>File New Capital Expense</DialogTitle>
            <DialogDescription>Submit an administrative payout request or staff claim for review.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateExpense} className="space-y-4 py-2">
            <div className="grid gap-3">
              {/* Category selector */}
              <div className="grid gap-1">
                <Label className="text-xs">Expense Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={val => setNewExpense(p => ({ ...p, category: val as ExpenseCategory }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vendor & Method in row */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1">
                  <Label className="text-xs">Vendor / Supplier</Label>
                  <Input
                    placeholder="Merchant name"
                    className="h-9 text-xs"
                    value={newExpense.vendor}
                    onChange={e => setNewExpense(p => ({ ...p, vendor: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Payment Method</Label>
                  <Select
                    value={newExpense.paymentMethod}
                    onValueChange={val => setNewExpense(p => ({ ...p, paymentMethod: val }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount & Date in row */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1">
                  <Label className="text-xs">Denomination (INR / ₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-9 text-xs"
                    value={newExpense.amount}
                    onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Invoice Date</Label>
                  <Input
                    type="date"
                    className="h-9 text-xs"
                    value={newExpense.date}
                    onChange={e => setNewExpense(p => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-1">
                <Label className="text-xs">Description / Justification</Label>
                <Input
                  placeholder="Detail explaining the expenditure..."
                  className="h-9 text-xs"
                  value={newExpense.description}
                  onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>

              {/* File Attachment */}
              <div className="grid gap-1">
                <Label className="text-xs">Invoice Attachment (Image Receipt)</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="h-9 text-xs"
                  />
                  {newExpense.attachmentUrl && (
                    <Badge className="bg-emerald-500 shrink-0 flex items-center justify-center rounded-lg text-[10px]">Uploaded</Badge>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={submittingExpense} className="w-full bg-[#8B1E1E] hover:bg-[#731919] text-white">
                {submittingExpense ? "Submitting Request..." : "File Expense Claim"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: AUDIT / DETAILS VIEW */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-4">
              <span>Financial Audit: {selectedExpense?.expenseId}</span>
              {selectedExpense?.approvalStatus && (
                <Badge className={
                  selectedExpense.approvalStatus === "Paid" ? "bg-emerald-500" :
                  selectedExpense.approvalStatus === "Approved" ? "bg-blue-500" :
                  selectedExpense.approvalStatus === "Rejected" ? "bg-rose-500" : "bg-amber-500"
                }>
                  {selectedExpense.approvalStatus}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Verify transaction specifics and comments in the historical ledger.</DialogDescription>
          </DialogHeader>

          {selectedExpense && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl text-xs font-semibold">
                <div>
                  <p className="text-[10px] text-muted-foreground">Category</p>
                  <p className="font-bold text-foreground">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Amount (Denomination)</p>
                  <p className="font-black text-[#8B1E1E]">₹{selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Vendor / Payee</p>
                  <p className="font-bold">{selectedExpense.vendor}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Method</p>
                  <p className="font-mono text-[10px] uppercase">{selectedExpense.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Submitted By</p>
                  <p className="text-foreground">{selectedExpense.createdBy?.name || "Staff"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Log Date</p>
                  <p className="text-muted-foreground">{format(new Date(selectedExpense.date), "PPP")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground">Description</p>
                  <p className="text-foreground/90 font-medium leading-relaxed">{selectedExpense.description}</p>
                </div>
              </div>

              {/* Action Log Comment Input */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-xs">Administrative Audit Remark</Label>
                  <Input
                    placeholder="Attach remarks to the historical ledger..."
                    value={auditComment}
                    onChange={e => setAuditComment(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingExpense}
                      onClick={() => handleUpdateApproval("Rejected")}
                      className="text-rose-500 border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold"
                    >
                      Reject Claim
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingExpense}
                      onClick={() => handleUpdateApproval("Approved")}
                      className="text-blue-500 border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-bold"
                    >
                      Approve Payout
                    </Button>
                    <Button
                      size="sm"
                      disabled={updatingExpense}
                      onClick={() => handleUpdateApproval("Paid")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Settle & Mark Paid
                    </Button>
                  </div>
                </div>
              )}

              {/* Historical Remarks List */}
              <div className="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <Label className="text-xs">Remarks Timeline</Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {selectedExpense.comments?.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic font-medium">Zero audit notes written for this outlay.</p>
                  ) : (
                    selectedExpense.comments?.map(c => (
                      <div key={c._id} className="p-2 bg-zinc-50 dark:bg-zinc-950/30 rounded-xl border text-[10px]">
                        <div className="flex justify-between font-bold text-muted-foreground pb-0.5">
                          <span>{c.user?.name || "Staff"}</span>
                          <span>{format(new Date(c.date), "MMM dd, hh:mm a")}</span>
                        </div>
                        <p className="text-foreground/90 font-medium">{c.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 3: CONFIGURE BUDGET */}
      <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Configure Category Limits</DialogTitle>
            <DialogDescription>Upsert spending budgets for the current academic session.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpsertBudget} className="space-y-4 py-2">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label className="text-xs">Category Context</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={val => setNewBudget(p => ({ ...p, category: val as ExpenseCategory }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label className="text-xs">Monthly Limit (INR / ₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  className="h-9 text-xs"
                  value={newBudget.monthlyLimit}
                  onChange={e => setNewBudget(p => ({ ...p, monthlyLimit: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-1">
                <Label className="text-xs">Yearly Target Limit (INR / ₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 600000"
                  className="h-9 text-xs"
                  value={newBudget.yearlyLimit}
                  onChange={e => setNewBudget(p => ({ ...p, yearlyLimit: e.target.value }))}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={submittingBudget} className="w-full bg-[#8B1E1E] text-white hover:bg-[#731919]">
                {submittingBudget ? "Updating limits..." : "Upsert Budget Targets"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
