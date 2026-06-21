import {
  Users,
  BookOpen,
  Clock,
  GraduationCap,
  CalendarDays,
  AlertCircle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserCheck,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsProps {
  role: string;
  data: any; // In real app, define a strict interface
}

export function DashboardStats({ role, data }: StatsProps) {
  // --- ADMIN VIEW ---
  if (role === "admin") {
    const { 
      totalStudents, 
      totalTeachers, 
      activeExams, 
      totalStudentsPresent, 
      financialMetrics, 
      operationalMetrics 
    } = data;
    
    return (
      <>
        {/* --- Academic Quick Stats --- */}
        {/* Student Body */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(139,30,30,0.05)] rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Body</CardTitle>
            <div className="p-2 rounded-xl bg-[#8B1E1E]/5 text-[#8B1E1E] dark:bg-[#8B1E1E]/10 transition-transform group-hover:scale-110 duration-300">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">{totalStudents || 0}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" /> Growth
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span>+{operationalMetrics?.newStudentsLast30Days || 0} new profiles this month</span>
            </p>
          </CardContent>
        </Card>

        {/* Faculty Strength */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(197,160,58,0.05)] rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#C5A03A] to-[#8B1E1E]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Faculty Strength</CardTitle>
            <div className="p-2 rounded-xl bg-[#C5A03A]/5 text-[#C5A03A] dark:bg-[#C5A03A]/10 transition-transform group-hover:scale-110 duration-300">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">{totalTeachers || 0}</span>
              <span className="text-[10px] font-bold text-[#C5A03A] bg-[#C5A03A]/10 px-1.5 py-0.5 rounded-full">
                Educators
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Active instructional & research staff</p>
          </CardContent>
        </Card>

        {/* Live Attendance */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.05)] rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Attendance</CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/5 text-blue-500 dark:bg-blue-500/10 transition-transform group-hover:scale-110 duration-300">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">{totalStudentsPresent || 0}</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded-full animate-pulse">
                Active Today
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Current student check-ins registered</p>
          </CardContent>
        </Card>

        {/* Active Assessments */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(139,30,30,0.05)] rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#8B1E1E] via-purple-500 to-[#C5A03A]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Exams</CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/5 text-purple-500 dark:bg-purple-500/10 transition-transform group-hover:scale-110 duration-300">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">{activeExams || 0}</span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                LMS Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Evaluations actively running in portal</p>
          </CardContent>
        </Card>

        {/* --- Financial Vital Signs --- */}
        {/* Total Revenue */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-gradient-to-br from-[#8B1E1E]/5 to-[#C5A03A]/5 dark:from-[#8B1E1E]/10 dark:to-zinc-900/50 border border-[#8B1E1E]/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#8B1E1E] dark:text-[#E27676]">Total Revenue</CardTitle>
            <div className="p-2 rounded-xl bg-[#8B1E1E] text-white transition-transform group-hover:rotate-12 duration-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-black tracking-tight text-[#8B1E1E] dark:text-white">
              ₹{(financialMetrics?.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <p className="text-xs text-[#8B1E1E]/70 dark:text-muted-foreground font-semibold">Fully verified via payment ledgers</p>
            </div>
          </CardContent>
        </Card>

        {/* Fees Outstanding */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-orange-500/10 dark:to-zinc-900/50 border border-orange-200/50 dark:border-orange-950/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">Fees Outstanding</CardTitle>
            <div className="p-2 rounded-xl bg-orange-500 text-white transition-transform group-hover:scale-110 duration-300">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-black tracking-tight text-orange-700 dark:text-orange-400">
              ₹{(financialMetrics?.totalOutstanding || 0).toLocaleString()}
            </div>
            <p className="text-xs text-orange-600/70 dark:text-muted-foreground font-semibold">Outstanding balances in pending invoices</p>
          </CardContent>
        </Card>

        {/* Operational Pulse */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 dark:from-yellow-500/10 dark:to-zinc-900/50 border border-yellow-200/50 dark:border-yellow-950/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Operational Pulse</CardTitle>
            <div className="p-2 rounded-xl bg-amber-500 text-white transition-transform group-hover:scale-110 duration-300">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 pt-1">
              <div>
                <div className="text-2xl font-black text-amber-800 dark:text-amber-400">{operationalMetrics?.pendingLeaves || 0}</div>
                <p className="text-[9px] text-amber-700/80 dark:text-muted-foreground uppercase font-bold tracking-wider">Leave Requests</p>
              </div>
              <div className="w-px h-10 bg-amber-200/50 dark:bg-zinc-800" />
              <div>
                <div className="text-2xl font-black text-amber-800 dark:text-amber-400">{operationalMetrics?.pendingComplaints || 0}</div>
                <p className="text-[9px] text-amber-700/80 dark:text-muted-foreground uppercase font-bold tracking-wider">Active Complaints</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Issues */}
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-gradient-to-br from-red-500/5 to-rose-600/5 dark:from-red-500/10 dark:to-zinc-900/50 border border-red-200/50 dark:border-red-950/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Critical Issues</CardTitle>
            <div className="p-2 rounded-xl bg-red-600 text-white transition-transform group-hover:animate-bounce duration-300">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-red-700 dark:text-red-400">{operationalMetrics?.criticalComplaints || 0}</span>
              {operationalMetrics?.criticalComplaints > 0 && (
                <span className="text-[9px] font-bold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                  Urgent Attention
                </span>
              )}
            </div>
            <p className="text-xs text-red-600/70 dark:text-muted-foreground font-semibold">AI-Identified high severity cases</p>
          </CardContent>
        </Card>
      </>
    );
  }

  // --- TEACHER VIEW ---
  if (role === "teacher") {
    return (
      <>
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-md rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Classes</CardTitle>
            <Users className="h-4 w-4 text-[#8B1E1E]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{data.myClassesCount || 0}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Assigned sections and cohorts</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-md rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Grading
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{data.pendingGrading || 0}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Submissions awaiting review
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-md rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Class</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate text-foreground">
              {data.nextClass || "No classes"}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {data.nextClassTime || "Enjoy your day!"}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  // --- STUDENT VIEW ---
  return (
    <>
      <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-md rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
          <Percent className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-foreground">{data.myAttendance || "0%"}</div>
          <p className="text-xs text-muted-foreground font-medium mt-1">Total registered semester percentage</p>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-md rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A]" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
          <BookOpen className="h-4 w-4 text-[#8B1E1E]" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-foreground">
            {data.pendingAssignments || 0}
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">Pending tasks due this week</p>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-md rounded-2xl">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Next Exam</CardTitle>
          <CalendarDays className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate text-foreground">
            {data.nextExam || "None"}
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            {data.nextExamDate || "Keep studying!"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
