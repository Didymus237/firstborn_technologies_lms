import { format } from "date-fns";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import type { ExamTermType } from "./ExamTermForm";

interface Props {
  data: ExamTermType[];
  loading: boolean;
  onRefresh: () => void;
}

const ExamTermTable = ({ data, loading, onRefresh }: Props) => {
  const toggleLock = async (term: ExamTermType) => {
    try {
      await api.put(`/exam-terms/${term._id}/lock`);
      toast.success(`Term ${term.isLocked ? "unlocked" : "locked"} successfully`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to toggle lock");
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Term Name</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Results</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No exam terms found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((term) => (
              <TableRow key={term._id}>
                <TableCell className="font-bold text-gray-800">{term.name}</TableCell>
                <TableCell className="text-gray-600">{term.academicYear?.name}</TableCell>
                <TableCell>{term.startDate ? format(new Date(term.startDate), "PPP") : "-"}</TableCell>
                <TableCell>{term.endDate ? format(new Date(term.endDate), "PPP") : "-"}</TableCell>
                <TableCell>
                  {term.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {term.isLocked ? (
                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 flex items-center gap-1 w-fit">
                      <Lock className="w-3 h-3" /> Locked
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1 w-fit">
                      <Unlock className="w-3 h-3" /> Open
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleLock(term)}
                    className={term.isLocked ? "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" : "text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100"}
                  >
                    {term.isLocked ? (
                      <><Unlock className="w-4 h-4 mr-1" /> Unlock Term</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-1" /> Lock Term</>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExamTermTable;
