import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import type { subject, user as UserType } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: {
    subjectId?: string;
    teacherId?: string;
    room?: string;
    startTime: string;
    endTime: string;
    day: string;
  };
  classId: string;
  academicYear: string;
}

export const PeriodDialog = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  classId,
  academicYear,
}: Props) => {
  const [subjects, setSubjects] = useState<subject[]>([]);
  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: "",
    teacherId: "",
    room: "",
  });

  const [conflicts, setConflicts] = useState<string[]>([]);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setFormData({
        subjectId: initialData?.subjectId || "",
        teacherId: initialData?.teacherId || "",
        room: initialData?.room || "",
      });
      setConflicts([]);
    }
  }, [isOpen, initialData]);

  const fetchData = async () => {
    try {
      const [subRes, teachRes] = await Promise.all([
        api.get(`/classes/${classId}`), // To get subjects for this class
        api.get("/users?role=teacher"),
      ]);
      setSubjects(subRes.data.subjects || []);
      setTeachers(teachRes.data.users || []);
    } catch (error) {
      toast.error("Failed to load teachers or subjects");
    }
  };

  const checkConflicts = async () => {
    if (!formData.teacherId && !formData.room) return;
    setIsCheckingConflict(true);
    try {
      const { data } = await api.post("/timetables/check-conflict", {
        teacherId: formData.teacherId,
        roomId: formData.room,
        day: initialData?.day,
        startTime: initialData?.startTime,
        endTime: initialData?.endTime,
        academicYear,
        excludeClassId: classId,
      });
      setConflicts(data.conflicts || []);
    } catch (error) {
      console.error("Conflict check failed");
    } finally {
      setIsCheckingConflict(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen) checkConflicts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.teacherId, formData.room, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.teacherId) {
        // If its not a break, we need these. For now assume its a class.
    }
    
    try {
      setIsSaving(true);
      await onSave({
          ...formData,
          day: initialData?.day,
          startTime: initialData?.startTime,
          endTime: initialData?.endTime,
          type: "class"
      });
      onClose();
    } catch (error) {
      toast.error("Failed to save period");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit Period: {initialData?.day} ({initialData?.startTime} - {initialData?.endTime})
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(val) => setFormData({ ...formData, subjectId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Teacher</Label>
            <Select
              value={formData.teacherId}
              onValueChange={(val) => setFormData({ ...formData, teacherId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Room / Class (Optional)</Label>
            <Input
              placeholder="e.g. Room 101"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
          </div>

          {conflicts.length > 0 && (
            <div className="bg-destructive/10 p-3 rounded-md flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs text-destructive space-y-1">
                <p className="font-bold">Conflicts Detected:</p>
                {conflicts.map((c, i) => (
                  <p key={i}>{c}</p>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isCheckingConflict}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
