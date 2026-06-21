import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import ExamTermTable from "@/components/exam-term/exam-term-table";
import ExamTermForm, { type ExamTermType } from "@/components/exam-term/ExamTermForm";

const ExamTerms = () => {
  const [terms, setTerms] = useState<ExamTermType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/exam-terms");
      if (data.terms) {
        setTerms(data.terms);
      } else {
        setTerms([]);
      }
    } catch (error) {
      toast.error("Failed to fetch exam terms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Terms</h1>
          <p className="text-muted-foreground">Manage reporting periods and exam sessions.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCreate} className="bg-[#8B1E1E] hover:bg-[#601010] text-white">
            <Plus className="mr-2 h-4 w-4" /> Add New Term
          </Button>
        </div>
      </div>
      
      <ExamTermTable
        data={terms}
        loading={loading}
        onRefresh={fetchTerms}
      />
      
      <ExamTermForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchTerms}
      />
    </div>
  );
};

export default ExamTerms;
