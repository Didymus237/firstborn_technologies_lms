import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, PieChart as PieChartIcon, BarChart3, TrendingUp } from "lucide-react";

interface ChartsProps {
  role: string;
  data: any;
}

// Custom Glassmorphic Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-3 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-lg space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
        {label && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>}
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-muted-foreground font-medium">{entry.name}:</span>
            <span className="text-foreground font-bold">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ role, data }: ChartsProps) {
  // Only show comprehensive charts for Admin right now
  if (role !== "admin") return null;

  // Classy brand-inspired palette
  const brandColors = {
    crimson: "#8B1E1E",
    gold: "#C5A03A",
    mutedCrimson: "rgba(139, 30, 30, 0.4)",
    mutedGold: "rgba(197, 160, 58, 0.4)",
    slate: "#64748B",
    indigo: "#6366F1",
    emerald: "#10B981"
  };

  const pieColors = [brandColors.crimson, brandColors.gold, brandColors.slate, brandColors.indigo];

  const attendanceData = data.attendanceTrends || [];
  const demographicsData = data.systemOverview || [];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 w-full mt-6">
      {/* 1. Attendance Area Chart (Spans 4 columns) */}
      <Card className="col-span-4 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-[#8B1E1E]" />
        <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Attendance Trends</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">7-Day Rolling Presence Analytics</CardDescription>
          </div>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="h-[280px] pr-2">
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brandColors.crimson} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={brandColors.crimson} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={brandColors.gold} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={brandColors.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="present" stroke={brandColors.crimson} strokeWidth={2.5} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                <Area type="monotone" dataKey="absent" stroke={brandColors.gold} strokeWidth={2.5} fillOpacity={1} fill="url(#colorAbsent)" name="Absent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">No active analytics found</div>
          )}
        </CardContent>
      </Card>

      {/* 2. Demographics Pie Chart (Spans 3 columns) */}
      <Card className="col-span-3 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#C5A03A] to-[#8B1E1E]" />
        <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-foreground">System Demographics</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">User role distributions inside database</CardDescription>
          </div>
          <div className="p-1.5 rounded-lg bg-[#C5A03A]/10 text-[#C5A03A] group-hover:scale-105 transition-transform">
            <PieChartIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          {demographicsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {demographicsData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} className="focus:outline-none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">No metrics found</div>
          )}
        </CardContent>
      </Card>

      {/* 4. Financial Revenue Distribution (Spans 3 columns) */}
      <Card className="col-span-3 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A]" />
        <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Revenue Mix</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Digital Online vs Cash ledger receipts</CardDescription>
          </div>
          <div className="p-1.5 rounded-lg bg-[#8B1E1E]/10 text-[#8B1E1E] group-hover:scale-105 transition-transform">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="h-[230px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Online Gateway', value: data.financialMetrics?.onlineRevenue || 0 },
                    { name: 'Manual Cash', value: data.financialMetrics?.cashRevenue || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill={brandColors.gold} className="focus:outline-none" />
                  <Cell fill={brandColors.crimson} className="focus:outline-none" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5. Operational Health Bar Chart (Spans 4 columns) */}
      <Card className="col-span-4 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8B1E1E] via-orange-500 to-[#C5A03A]" />
        <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Operational Backlog</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Action items and pending approvals</CardDescription>
          </div>
          <div className="p-1.5 rounded-lg bg-[#8B1E1E]/10 text-[#8B1E1E] group-hover:scale-105 transition-transform">
            <BarChart3 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={[
                    { name: 'Leaves', value: data.operationalMetrics?.pendingLeaves || 0, fill: brandColors.gold },
                    { name: 'Complaints', value: data.operationalMetrics?.pendingComplaints || 0, fill: brandColors.indigo },
                    { name: 'Critical', value: data.operationalMetrics?.criticalComplaints || 0, fill: brandColors.crimson }
                ]} 
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            >
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
