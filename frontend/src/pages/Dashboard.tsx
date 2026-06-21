import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { useNavigate } from "react-router";

// UI Imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Settings2, 
  UserPlus, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap,
  Wallet,
  Globe,
  Clock
} from "lucide-react";

// Custom Components
import { AiInsightWidget } from "@/components/dashboard/ai-insight-widget";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { StudentAttendanceSummary } from "@/components/attendance/StudentAttendanceSummary";
import { TeacherAttendanceSummary } from "@/components/attendance/TeacherAttendanceSummary";
import { AttendanceAdminReports } from "@/components/attendance/AttendanceAdminReports";

export default function Dashboard() {
  const { user, year } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>({});

  // 1. Fetch Data Logic
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/dashboard/stats");
        // Flatten backend nested structure to match DashboardStats props
        setStatsData({ ...data.stats, recentActivities: data.recentActivities });
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  // 2. Loading State
  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-[#FCFCFC] dark:bg-[#121212] min-h-screen">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-zinc-200/60 dark:bg-zinc-800" />
            <Skeleton className="h-4 w-40 bg-zinc-200/60 dark:bg-zinc-800" />
          </div>
          <Skeleton className="h-11 w-36 bg-zinc-200/60 dark:bg-zinc-800 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-zinc-200/60 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="col-span-4 h-[300px] bg-zinc-200/60 dark:bg-zinc-800 rounded-2xl" />
          <Skeleton className="col-span-3 h-[300px] bg-zinc-200/60 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 pt-6 bg-[#FCFCFC] dark:bg-[#121212] min-h-screen">
      
      {/* Decorative blurred backdrops for premium aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B1E1E]/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-[#C5A03A]/3 blur-[100px] rounded-full pointer-events-none" />

      {/* --- HEADER --- */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6 border-zinc-200 dark:border-zinc-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Command Center
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Welcome Back, <span className="text-[#8B1E1E] dark:text-[#E27676]">{user?.name || "Admin"}</span>
          </h2>
          <p className="text-sm text-muted-foreground font-semibold flex items-center gap-1.5">
            <span>Academic Year Session</span> 
            <span className="text-foreground bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-700/50 font-bold">{year?.name || "Active Session"}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {user?.role === "admin" ? (
            <>
              <Button 
                variant="outline" 
                className="h-11 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all duration-300"
                onClick={() => navigate("/settings/school")}
              >
                <Settings2 className="h-4 w-4 text-[#C5A03A]" />
                School Settings
              </Button>
              <Button 
                className="h-11 bg-[#8B1E1E] hover:bg-[#8B1E1E]/95 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-[#8B1E1E]/20 transition-all duration-300 flex items-center gap-2"
                onClick={() => navigate("/users/students")}
              >
                <UserPlus className="h-4 w-4" />
                Add Student
              </Button>
            </>
          ) : (
            <Button 
              className="h-11 bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A] hover:opacity-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              onClick={() => navigate("/finance/my-fees")}
            >
              <span>💳</span> Make a Payment
            </Button>
          )}
        </div>
      </div>

      {user?.role === "admin" ? (
        <div className="space-y-10 relative z-10">

          {/* --- HUB 1: FINANCIAL & REVENUE INTELLIGENCE --- */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-[#C5A03A] rounded-full" />
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Financial & Revenue Intelligence</span>
              </h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
               <DashboardStats role="admin" data={statsData} />
            </div>
            
            <DashboardCharts role="admin" data={statsData} />
          </section>

          {/* --- HUB 2: ACADEMIC & LMS PERFORMANCE --- */}
          <section className="space-y-5 bg-zinc-50/40 dark:bg-zinc-950/20 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-[#8B1E1E] rounded-full" />
              <h3 className="text-xl font-bold tracking-tight text-foreground">Academic & LMS Control Center</h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-7">
               <div className="col-span-4 h-full">
                  <AiInsightWidget role="admin" />
               </div>
               
               <div className="col-span-3">
                  <Card className="h-full border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-bold text-[#8B1E1E] dark:text-[#E27676] flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Quick Module Access
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">Direct path routing to system engines</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        {[
                          { name: "ID Designer", path: "/id-cards/designer", icon: "🎨" },
                          { name: "Offer Letters", path: "/offer-letters", icon: "✉️" },
                          { name: "Timetables", path: "/timetable", icon: "📅" },
                          { name: "Fee Ledger", path: "/finance/receipts", icon: "💰" },
                          { name: "Complaints", path: "/helpdesk/manage-complaints", icon: "🚨" },
                          { name: "Faculty Leave", path: "/helpdesk/manage-leaves", icon: "🏖️" },
                        ].map(m => (
                          <Button 
                            key={m.path} 
                            variant="ghost" 
                            className="justify-start gap-2.5 hover:bg-[#8B1E1E]/5 hover:text-[#8B1E1E] dark:hover:bg-zinc-800/80 dark:hover:text-white text-foreground/80 font-bold rounded-xl transition-all duration-200 h-10 text-xs" 
                            onClick={() => navigate(m.path)}
                          >
                            <span className="text-base">{m.icon}</span> 
                            <span>{m.name}</span>
                          </Button>
                        ))}
                    </CardContent>
                  </Card>
               </div>
            </div>
          </section>

          {/* --- HUB 3: ATTENDANCE & REPORTING --- */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-[#C5A03A] rounded-full" />
              <h3 className="text-xl font-bold tracking-tight text-foreground">Attendance Monitor & Reports</h3>
            </div>
            <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xs">
              <AttendanceAdminReports />
            </div>
          </section>

          {/* --- HUB 4: SYSTEM AUDIT & ACTIVITY --- */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Recent Activity Card */}
              <Card className="lg:col-span-2 border-none bg-gradient-to-br from-[#8B1E1E] via-[#5C1414] to-[#290505] text-white overflow-hidden relative shadow-xl rounded-2xl group">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A03A]/20 blur-3xl -mr-20 -mt-20 rounded-full group-hover:scale-110 transition-transform duration-500" />
                 <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#C5A03A] animate-pulse" />
                      <span>Recent System Activity</span>
                    </CardTitle>
                    <CardDescription className="text-white/70 text-xs font-medium">Real-time verification logs across all nodes</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-3">
                      {statsData.recentActivities?.slice(0, 4).map((activity: string, i: number) => (
                        <div key={i} className="flex items-center gap-3.5 p-3.5 bg-white/10 hover:bg-white/15 rounded-xl backdrop-blur-md border border-white/10 transition-colors duration-200">
                           <div className="w-2 h-2 bg-[#C5A03A] rounded-full animate-ping" />
                           <p className="text-xs md:text-sm font-semibold tracking-wide text-white/95">{activity}</p>
                        </div>
                      ))}
                    </div>
                 </CardContent>
              </Card>
              
              {/* Enrollment Growth summary */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-xs rounded-2xl group flex flex-col justify-between hover:shadow-md transition-shadow">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-foreground">Growth Summary</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Registered acquisition vs targets</CardDescription>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-32 h-32 group-hover:scale-105 transition-transform duration-500">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          {/* Track */}
                          <path className="text-zinc-100 dark:text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          {/* Indicator */}
                          <path className="text-[#C5A03A]" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-extrabold text-2xl text-foreground">75%</span>
                          <span className="text-[8px] text-muted-foreground font-mono uppercase tracking-tighter">Cap reached</span>
                        </div>
                    </div>
                    
                    <div className="mt-5 w-full flex items-center justify-between text-xs text-muted-foreground font-semibold px-2">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#C5A03A] rounded-xs" /> Target</span>
                      <span className="text-foreground font-extrabold">2.4k users</span>
                    </div>
                 </CardContent>
              </Card>
          </section>
        </div>
      ) : (
        /* Simplified View for Students/Teachers */
        <div className="space-y-8 relative z-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardStats role={user?.role || "student"} data={statsData} />
          </div>

          {user?.role === "student" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Internship & Training Card */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-xs rounded-2xl">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                  <CardTitle className="text-base font-extrabold text-[#8B1E1E] dark:text-[#E27676] flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#C5A03A]" /> Internship & Training Profile
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Active trainee registrations & schedules</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Training Program</span>
                    <span className="text-sm font-extrabold text-foreground mt-0.5 block">{user.department || "General Training"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">School of Origin</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block truncate" title={user.internshipSchool}>{user.internshipSchool || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">{user.trainingDuration || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Passport Number</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block font-mono">{user.passportNumber || "N/A"}</span>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div>
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</span>
                      <span className="text-xs font-bold text-foreground block">
                        {user.trainingStartDate ? new Date(user.trainingStartDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">End Date</span>
                      <span className="text-xs font-bold text-foreground block">
                        {user.trainingEndDate ? new Date(user.trainingEndDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary Card */}
              <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-xs rounded-2xl flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-extrabold text-[#8B1E1E] dark:text-[#E27676] flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-[#C5A03A]" /> Financial Summary
                      </CardTitle>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest ${
                        (user.amountPaid || 0) >= (user.totalTrainingFee || 0) && (user.totalTrainingFee || 0) > 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : (user.amountPaid || 0) > 0
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      }`}>
                        {(user.amountPaid || 0) >= (user.totalTrainingFee || 0) && (user.totalTrainingFee || 0) > 0
                          ? "Paid"
                          : (user.amountPaid || 0) > 0
                          ? "Partial"
                          : "Unpaid"
                        }
                      </span>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">Trainee course fee allocation ledger</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total Fee</span>
                      <span className="text-base font-black text-foreground block mt-0.5">₹{Number(user.totalTrainingFee || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-emerald-600">Amount Paid</span>
                      <span className="text-base font-black text-emerald-600 block mt-0.5">₹{Number(user.amountPaid || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-orange-600">Pending</span>
                      <span className="text-base font-black text-orange-600 block mt-0.5">₹{Number(user.amountPending || 0).toLocaleString()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="col-span-3 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                        <span>Settlement Progress</span>
                        <span>{user.totalTrainingFee ? Math.min(100, Math.round(((user.amountPaid || 0) / user.totalTrainingFee) * 100)) : 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A]" 
                          style={{ width: `${user.totalTrainingFee ? Math.min(100, Math.round(((user.amountPaid || 0) / user.totalTrainingFee) * 100)) : 0}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>
                <CardContent className="pb-4 pt-0">
                  <Button 
                    className="w-full h-10 bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A] hover:opacity-95 text-white font-bold rounded-xl shadow-xs text-xs tracking-wider uppercase transition-all duration-300"
                    onClick={() => navigate("/finance/my-fees")}
                  >
                    View Invoices & Pay Outstanding
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <section className="space-y-4 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-[#8B1E1E] rounded-full" />
              <h3 className="text-lg font-bold tracking-tight text-foreground">Attendance Overview</h3>
            </div>
            {user?.role === "student" ? <StudentAttendanceSummary /> : <TeacherAttendanceSummary />}
          </section>

          <div className="grid gap-6 md:grid-cols-7 mt-4">
             <div className="col-span-4 space-y-6">
                <AiInsightWidget role={user?.role} />
                
                <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-xs rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground">Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3.5">
                      {statsData.recentActivities?.map((activity: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 last:border-0 last:pb-0">
                          <CheckCircle2 className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                          <p className="text-sm font-semibold text-foreground/80 leading-relaxed">{activity}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
             </div>
             
             <div className="col-span-3">
                <Card className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-xs rounded-2xl h-full flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-foreground">My Schedules & Portals</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-between hover:bg-[#C5A03A]/5 border-zinc-200 dark:border-zinc-800/80 text-foreground font-bold rounded-xl h-11 transition-all duration-200 group" 
                      onClick={() => navigate("/finance/my-fees")}
                    >
                      <span className="flex items-center gap-2"><span>💳</span> Make a Payment</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between border-zinc-200 dark:border-zinc-800/80 text-foreground font-bold rounded-xl h-11 transition-all duration-200 group" 
                      onClick={() => navigate("/timetable")}
                    >
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#8B1E1E]" /> Timetable</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-between border-zinc-200 dark:border-zinc-800/80 text-foreground font-bold rounded-xl h-11 transition-all duration-200 group" 
                      onClick={() => navigate("/lms/materials")}
                    >
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#C5A03A]" /> Materials</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
