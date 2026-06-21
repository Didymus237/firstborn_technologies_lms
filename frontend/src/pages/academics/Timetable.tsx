import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import type { schedule } from "@/types";
import GeneratorControls, {
  type GenSettings,
} from "@/components/timetable/GeneratorControls";
import TimetableGrid from "@/components/timetable/TimetableGrid";
import { PeriodDialog } from "@/components/timetable/PeriodDialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportTimetableToPDF } from "@/utils/pdfExport";
import { useMemo } from "react";

const Timetable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  const [scheduleData, setScheduleData] = useState<schedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Manual Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // fetch timetable
  const fetchTimetable = async (classId: string, yearId: string) => {
    if (!classId) return;

    try {
      setLoadingSchedule(true);
      const url = yearId ? `/timetables/${classId}?academicYear=${yearId}` : `/timetables/${classId}`;
      const { data } = await api.get(url);
      setScheduleData(data.schedule || []);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setScheduleData([]);
        if (!isAdmin) {
          toast("No schedule found for this class", { icon: "📅" });
        }
      } else {
        toast.error("Failed to load timetable");
      }
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleCellClick = (day: string, time: string, period?: any) => {
    if (!isAdmin) return;
    setSelectedSlot({
      day,
      startTime: time,
      endTime: period?.endTime || "", // We might need to handle empty cells better
      subjectId: period?.subject?._id,
      teacherId: period?.teacher?._id,
      room: period?.room,
    });
    setIsDialogOpen(true);
  };

  const handleSavePeriod = async (data: any) => {
    try {
      // Logic to update the scheduleData locally and then call the PUT API
      const newSchedule = [...scheduleData];
      let dayData = newSchedule.find(d => d.day === data.day);
      
      if (!dayData) {
        dayData = { day: data.day, periods: [] };
        newSchedule.push(dayData);
      }

      const existingPeriodIdx = dayData.periods.findIndex(p => p.startTime === data.startTime);
      const updatedPeriod = {
          subject: data.subjectId,
          teacher: data.teacherId,
          room: data.room,
          startTime: data.startTime,
          endTime: data.endTime || "00:00", // Fallback
          type: data.type || "class"
      };

      if (existingPeriodIdx > -1) {
        dayData.periods[existingPeriodIdx] = updatedPeriod as any;
      } else {
        dayData.periods.push(updatedPeriod as any);
      }

      await api.put(`/timetables/${selectedClass}`, {
        academicYear: selectedYear,
        schedule: newSchedule
      });
      
      toast.success("Timetable updated");
      fetchTimetable(selectedClass, selectedYear);
    } catch (error) {
      toast.error("Failed to update timetable");
    }
  };

  // auto fetch using useEffect
  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass, selectedYear);
    }
  }, [selectedClass, selectedYear]);

  // Handle student auto-selection
  useEffect(() => {
    if (isStudent && user?.studentClass) {
      const sClass = typeof user.studentClass === 'string' ? user.studentClass : (user.studentClass as any)._id;
      if (sClass) {
        setSelectedClass(sClass);
      }
    }
  }, [isStudent, user]);

  const handleGenerate = async (
    selectedClass: string,
    yearId: string,
    settings: GenSettings
  ) => {
    try {
      setIsGenerating(true);
      // sorry about that, we should be passing classId instead of selectedClass, now that won't work coz class is not assigned teachers and subjects
      const { data } = await api.post("/timetables/generate", {
        classId: selectedClass,
        academicYear: yearId,
        settings,
      });

      toast.success(data.message || "AI Generation Started");

      // Poll for updates (simple version)
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await api.get(`/timetables/${selectedClass}?academicYear=${yearId}`);
          if (res.data && res.data.schedule && res.data.schedule.length > 0) {
            setScheduleData(res.data.schedule);
            setIsGenerating(false);
            clearInterval(interval);
            toast.success("Schedule generated and applied successfully!");
          }
        } catch (e) {
          // Ignore 404s while waiting
        }
        if (attempts >= 10) { // 50 seconds timeout
          setIsGenerating(false);
          clearInterval(interval);
          toast.error("Generation is taking longer than expected. Please manually refresh.");
        }
      }, 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Generation failed");
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!scheduleData || scheduleData.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    exportTimetableToPDF(
      scheduleData,
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "Class Timetable",
      "Official Academic Schedule"
    );
    toast.success("Downloading PDF...");
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Timetable Management
        </h1>
        <p className="text-muted-foreground">
          {isStudent
            ? "View your weekly class schedule."
            : "View or manage weekly schedules."}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        {scheduleData.length > 0 && (
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {!isStudent && (
        <GeneratorControls
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      )}
      <TimetableGrid 
        schedule={scheduleData} 
        isLoading={loadingSchedule} 
        onCellClick={handleCellClick}
      />

      <PeriodDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSavePeriod}
        classId={selectedClass}
        academicYear={selectedYear}
        initialData={selectedSlot}
      />
    </div>
  );
};

export default Timetable;
