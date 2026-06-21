import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { AttendanceStudentView } from "@/components/attendance/AttendanceStudentView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Student = {
    _id: string;
    name: string;
    email: string;
};

type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

type AttendanceRecord = {
    student: string; // ID
    status: AttendanceStatus;
    remarks?: string;
};

const Attendance = () => {
  const { user } = useAuth();
  
  if (user?.role === "student") {
    return <AttendanceStudentView />;
  }

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const isTeacher = user?.role === "teacher";
  
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [records, setRecords] = useState<{ [studentId: string]: AttendanceRecord }>({});
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    api.get("/classes").then((res) => {
      setClasses(res.data.data || []);
    }).catch(() => toast.error("Failed to load classes for attendance"));
  }, []);

  // When class changes, fetch the full class details to get the students
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      api.get(`/classes/${selectedClass}`)
        .then((res: any) => {
          setStudentsData(res.data.students || []);
          const classSubjects = res.data.subjects || [];
          
          // RBAC: If teacher, only show subjects they teach
          if (isTeacher) {
            const teacherSubjects = classSubjects.filter((s: any) => 
               s.teacher === user?._id || s.teacher?._id === user?._id
            );
            setSubjects(teacherSubjects);
          } else {
            setSubjects(classSubjects);
          }
          setSelectedSubject("");
        })
        .catch(() => toast.error("Failed to load class roster"))
        .finally(() => setLoading(false));
    }
  }, [selectedClass, isTeacher, user]);

  const handleFetchAttendance = async () => {
    if (!selectedClass || !selectedSubject || !date) {
        toast.error("Please select class, subject and date");
        return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/class/${selectedClass}?date=${date}&subjectId=${selectedSubject}`);
      
      // If records exist for this day
      if (data && data.length > 0) {
          const existingConfig = data[0]; // newest logic pushes first
          const mapped: any = {};
          
          existingConfig.records.forEach((r: any) => {
             // Depending on backend population r.student could be object or string.
             const sId = typeof r.student === "object" ? r.student._id : r.student;
             mapped[sId] = {
                 student: sId,
                 status: r.status,
                 remarks: r.remarks || ""
             };
          });
          setRecords(mapped);
          setIsUpdate(true);
          toast.success("Loaded existing attendance records");
      } else {
          // Initialize blank roster marking everyone present
          const mapped: any = {};
          studentsData.forEach(s => {
              mapped[s._id] = { student: s._id, status: "Present", remarks: "" };
          });
          setRecords(mapped);
          setIsUpdate(false);
          toast.info("No records for this date. Ready to mark.");
      }
    } catch (e) {
      toast.error("Failed to fetch attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
      setRecords(prev => ({
          ...prev,
          [studentId]: {
              ...prev[studentId],
              status
          }
      }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
      setRecords(prev => ({
          ...prev,
          [studentId]: {
              ...prev[studentId],
              remarks
          }
      }));
  };

  const handleSaveAttendance = async () => {
      try {
          setSaving(true);
          const payloadRecords = Object.values(records);
          
          await api.post("/attendance", {
              classId: selectedClass,
              subjectId: selectedSubject,
              date,
              records: payloadRecords
          });
          
          toast.success("Attendance saved successfully!");
          setIsUpdate(true);
      } catch (error) {
          toast.error("Failed to save attendance");
      } finally {
          setSaving(false);
      }
  };

  const handleMarkAllPresent = () => {
    const newRecords = { ...records };
    studentsData.forEach(s => {
      newRecords[s._id] = { ...newRecords[s._id], status: "Present" };
    });
    setRecords(newRecords);
    toast.success("All students marked as Present");
  };

  const hasLoadedRoster = Object.keys(records).length > 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Manage and track student attendance.</p>
      </div>

      <div className="bg-card p-4 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub._id} value={sub._id}>{sub.name} ({sub.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} 
            />
          </div>

          <Button onClick={handleFetchAttendance} disabled={!selectedClass || !selectedSubject || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            {loading ? "Loading..." : "Load Roster"}
          </Button>
      </div>

      {hasLoadedRoster ? (
          <div className="bg-card border rounded-lg overflow-hidden flex flex-col">
              <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg">
                        Roster: {classes.find(c => c._id === selectedClass)?.name} - {subjects.find(s => s._id === selectedSubject)?.name}
                        <span className="text-muted-foreground ml-2 text-sm">{new Date(date).toDateString()}</span>
                    </h2>
                    <Badge variant={isUpdate ? "default" : "secondary"}>
                        {isUpdate ? "Updating Existing" : "New Entry"}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                      Mark All Present
                  </Button>
              </div>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studentsData.map((student) => {
                        const rec = records[student._id];
                        if (!rec) return null; // Safety catch

                        return (
                            <TableRow key={student._id}>
                                <TableCell>
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant={rec.status === "Present" ? "default" : "outline"}
                                            className={rec.status === "Present" ? "bg-green-600 hover:bg-green-700" : ""}
                                            onClick={() => handleStatusChange(student._id, "Present")}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" /> P
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={rec.status === "Absent" ? "destructive" : "outline"}
                                            onClick={() => handleStatusChange(student._id, "Absent")}
                                        >
                                            <XCircle className="h-4 w-4 mr-1" /> A
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={rec.status === "Late" ? "default" : "outline"}
                                            className={rec.status === "Late" ? "bg-amber-500 hover:bg-amber-600" : ""}
                                            onClick={() => handleStatusChange(student._id, "Late")}
                                        >
                                            <Clock className="h-4 w-4 mr-1" /> L
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant={rec.status === "Excused" ? "default" : "outline"}
                                            className={rec.status === "Excused" ? "bg-blue-500 hover:bg-blue-600" : ""}
                                            onClick={() => handleStatusChange(student._id, "Excused")}
                                        >
                                            <Badge variant="outline" className="h-4 w-4 mr-1 p-0 flex items-center justify-center">E</Badge> E
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        placeholder="Optional remarks..." 
                                        value={rec.remarks || ""}
                                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                                        className="max-w-[200px]"
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
             </Table>
             <div className="p-4 border-t flex justify-end bg-muted/20">
                 <Button onClick={handleSaveAttendance} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUpdate ? "Update Records" : "Save Attendance"}
                 </Button>
             </div>
          </div>
      ) : (
          <div className="border border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50">
             <Calendar className="h-12 w-12 mb-4 opacity-20" />
             <p className="text-lg font-medium">No Roster Loaded</p>
             <p className="text-sm">Select a class and date to view or mark attendance records.</p>
          </div>
      )}
    </div>
  );
};

export default Attendance;
