import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import type { AttendanceAnalytics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

export const StudentAttendanceSummary = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<AttendanceAnalytics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            api.get(`/attendance/analytics/${user._id}`)
                .then(res => setAnalytics(res.data))
                .catch(err => console.error("Failed to load attendance analytics", err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (analytics.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                    <p>No attendance records found yet.</p>
                </CardContent>
            </Card>
        );
    }

    const overallTotal = analytics.reduce((acc, curr) => acc + curr.totalClasses, 0);
    const overallPresent = analytics.reduce((acc, curr) => acc + curr.present, 0);
    const overallLate = analytics.reduce((acc, curr) => acc + curr.late, 0);
    const overallPercentage = overallTotal > 0 ? ((overallPresent + (overallLate * 0.5)) / overallTotal) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overallPercentage.toFixed(1)}%</div>
                        <Progress value={overallPercentage} className="h-2 mt-4" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overallTotal}</div>
                        <p className="text-xs text-muted-foreground mt-1">Held across all subjects</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Attended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{overallPresent + overallLate}</div>
                        <p className="text-xs text-muted-foreground mt-1">{overallPresent} Present, {overallLate} Late</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Absences</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">{analytics.reduce((acc, curr) => acc + curr.absent, 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Missed classes</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.map((item) => (
                    <Card key={item.subjectId} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3 border-b bg-muted/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{item.subjectName}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{item.subjectCode}</p>
                                </div>
                                <div className={`text-xl font-bold ${item.percentage >= 75 ? 'text-green-600' : 'text-amber-500'}`}>
                                    {item.percentage.toFixed(0)}%
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4 flex-1">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Attendance Progress</span>
                                    <span className="font-medium">{item.present + item.late} / {item.totalClasses}</span>
                                </div>
                                <Progress 
                                    value={item.percentage} 
                                    className={`h-2 ${item.percentage < 75 ? '[&>div]:bg-amber-500' : ''}`} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <div className="text-sm">
                                        <div className="font-bold">{item.present}</div>
                                        <div className="text-[10px] text-muted-foreground">Present</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-destructive" />
                                    <div className="text-sm">
                                        <div className="font-bold">{item.absent}</div>
                                        <div className="text-[10px] text-muted-foreground">Absent</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <div className="text-sm">
                                        <div className="font-bold">{item.late}</div>
                                        <div className="text-[10px] text-muted-foreground">Late</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-blue-500" />
                                    <div className="text-sm">
                                        <div className="font-bold">{item.excused}</div>
                                        <div className="text-[10px] text-muted-foreground">Excused</div>
                                    </div>
                                </div>
                            </div>
                            
                            {item.percentage < 75 && (
                                <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" />
                                    Attendance below 75% requirement.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
