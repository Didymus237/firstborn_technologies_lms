import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import type { schedule, academicYear } from "@/types";
import TimetableGrid from "@/components/timetable/TimetableGrid";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportTimetableToPDF } from "@/utils/pdfExport";

export const TeacherTimetable = () => {
  const { user } = useAuth();
  const [scheduleData, setScheduleData] = useState<schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState<academicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const { data } = await api.get("/academic-years");
        const yearsData = Array.isArray(data) ? data : data.academicYears || [];
        setYears(yearsData);
        const current = yearsData.find((y: any) => y.isCurrent) || yearsData[0];
        if (current) setSelectedYear(current._id);
      } catch (error) {
        toast.error("Failed to load academic years");
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (user?._id && selectedYear) {
      fetchTeacherSchedule();
    }
  }, [user?._id, selectedYear]);

  const fetchTeacherSchedule = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/timetables/teacher/${user?._id}?academicYear=${selectedYear}`);
      setScheduleData(data);
    } catch (error) {
      toast.error("Failed to load your personal schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!scheduleData || scheduleData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const yearName = years.find(y => y._id === selectedYear)?.name || "Current Year";
    
    exportTimetableToPDF(
      scheduleData,
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      `${user?.name || "Teacher"}'s Personal Schedule`,
      `Academic Year: ${yearName}`
    );
    toast.success("Downloading PDF...");
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#8B1E1E]">My Personal Schedule</h1>
          <p className="text-muted-foreground">Detailed weekly teaching activities across all your assigned classes.</p>
        </div>
        <div className="flex items-center gap-3">
          {scheduleData.length > 0 && (
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
          <div className="w-full md:w-64 space-y-1 text-left">
            <Label className="text-xs">Academic Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (y._id && (
                  <SelectItem key={y._id} value={y._id}>{y.name}</SelectItem>
                )))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <TimetableGrid schedule={scheduleData} isLoading={loading} />
    </div>
  );
};
