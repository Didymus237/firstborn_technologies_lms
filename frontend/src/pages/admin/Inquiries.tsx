import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: "New" | "Contacted" | "Closed";
  createdAt: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/inquiries");
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/inquiries/${id}`, { status: newStatus });
      toast.success("Lead status updated");
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus as any } : inq))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New": return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case "Contacted": return <Badge className="bg-yellow-100 text-yellow-800">Contacted</Badge>;
      case "Closed": return <Badge className="bg-green-100 text-green-800">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admission Inquiries</h1>
          <p className="text-muted-foreground">Manage incoming public leads and track engagement status.</p>
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Prospect Name</TableHead>
              <TableHead>Contact (Email / Phone)</TableHead>
              <TableHead>Program Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tracking leads found.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry._id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">{inquiry.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1 text-sm text-gray-600">
                      <span>{inquiry.email}</span>
                      <span>{inquiry.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-indigo-700">{inquiry.course}</TableCell>
                  <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                  <TableCell className="text-right">
                    <select
                      className="border-gray-300 rounded p-1 text-sm"
                      value={inquiry.status}
                      onChange={(e) => updateStatus(inquiry._id, e.target.value)}
                    >
                      <option value="New">Mark New</option>
                      <option value="Contacted">Mark Contacted</option>
                      <option value="Closed">Mark Closed</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
