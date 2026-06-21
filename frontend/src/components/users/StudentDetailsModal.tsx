import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  DollarSign, 
  Clock, 
  BookOpen, 
  MapPin, 
  ShieldAlert,
  FileText,
  Bookmark,
  CalendarDays,
  Percent,
  GraduationCap
} from "lucide-react";
import type { user } from "@/types";
import { format } from "date-fns";
import { baseURL } from "@/lib/api";

interface StudentDetailsModalProps {
  student: user | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentDetailsModal({
  student,
  open,
  onOpenChange,
}: StudentDetailsModalProps) {
  if (!student) return null;

  const displayPhoto = student.photoUrl?.startsWith("http")
    ? student.photoUrl
    : student.photoUrl
    ? `${baseURL}${student.photoUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=8B1E1E&color=fff`;

  // Format Dates safely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not provided";
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  // Finance metrics
  const total = Number(student.totalTrainingFee) || 0;
  const paid = Number(student.amountPaid) || 0;
  const pending = Number(student.amountPending) || 0;
  const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  // Status Badge
  let statusText = "Unpaid";
  let statusStyle = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  if (paid > 0) {
    if (paid >= total && total > 0) {
      statusText = "Fully Paid";
      statusStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    } else {
      statusText = "Partial Payment";
      statusStyle = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 rounded-2xl bg-white dark:bg-[#121212] border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A]" />

        {/* Modal Header/Profile Banner */}
        <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 mt-1 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary/20 bg-white dark:bg-zinc-800 shrink-0 shadow-md">
            <img
              src={displayPhoto}
              alt={student.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">{student.name}</h2>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${statusStyle} tracking-widest`}>
                {statusText}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold font-mono uppercase tracking-wider">
              Student ID: {student.rollNumber || student.enrollmentNumber || "Awaiting Roll Allocation"}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">
              Enrolled Class: <span className="text-[#8B1E1E] dark:text-[#E27676]">{student.studentClass?.name || "Unassigned"}</span>
            </p>
          </div>
        </div>

        {/* Content Scroll Grid */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Profile & Contact */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B1E1E] border-b pb-1 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-[#C5A03A]" /> Personal Profile
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5 break-all">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" /> {student.email}
                  </span>
                </div>
                
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" /> {student.phone || "N/A"}
                  </span>
                </div>
                
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date of Birth</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" /> {formatDate(student.dob)}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Country of Origin</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-400" /> {student.country || "India"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Passport Number</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5 font-mono">
                    <FileText className="h-3.5 w-3.5 text-zinc-400" /> {student.passportNumber || "N/A"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Address</span>
                  <span className="text-sm font-semibold text-foreground flex items-start gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" /> {student.presentAddress || "N/A"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Permanent Address</span>
                  <span className="text-sm font-semibold text-foreground flex items-start gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" /> {student.permanentAddress || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Training & Academic details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B1E1E] border-b pb-1 flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-[#C5A03A]" /> Internship & Training
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">School / University (Internship Origin)</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Bookmark className="h-3.5 w-3.5 text-zinc-400 shrink-0" /> {student.internshipSchool || "N/A"}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Training Program</span>
                  <span className="text-sm font-extrabold text-[#8B1E1E] dark:text-[#E27676] flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="h-4 w-4" /> {student.department || "General Training"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" /> {student.trainingDuration || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <CalendarDays className="h-3.5 w-3.5 text-zinc-400" /> {formatDate(student.trainingStartDate)}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">End Date</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <CalendarDays className="h-3.5 w-3.5 text-zinc-400" /> {formatDate(student.trainingEndDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Summary Panel */}
          <div className="bg-[#8B1E1E]/3 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8B1E1E] flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-[#C5A03A]" /> Financial Account Overview
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total Training Fee</span>
                <span className="text-lg font-black text-foreground mt-1 block">₹{total.toLocaleString()}</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-emerald-600">Amount Paid</span>
                <span className="text-lg font-black text-emerald-600 mt-1 block">₹{paid.toLocaleString()}</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-orange-600">Amount Pending</span>
                <span className="text-lg font-black text-orange-600 mt-1 block">₹{pending.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> Percentage Settled</span>
                <span>{percentPaid}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A] transition-all duration-500" 
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 shadow-md"
          >
            Close Profile
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
