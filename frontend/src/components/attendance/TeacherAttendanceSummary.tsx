import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Attendance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, ClipboardCheck } from "lucide-react";

export const TeacherAttendanceSummary = () => {
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/attendance/teacher/summary")
            .then(res => setAttendanceRecords(res.data))
            .catch(err => console.error("Failed to load teacher attendance summary", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (attendanceRecords.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mb-4 opacity-20" />
                    <p>You haven't marked any attendance yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    My Attendance Logs
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceRecords.map((record) => {
                            const className = (record.classId as any)?.name || "N/A";
                            const subjectName = (record.subjectId as any)?.name || "N/A";
                            const subjectCode = (record.subjectId as any)?.code || "";
                            
                            const present = record.records.filter(r => r.status === 'Present').length;
                            const total = record.records.length;
                            const percentage = total > 0 ? (present / total) * 100 : 0;

                            return (
                                <TableRow key={record._id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            {new Date(record.date).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-semibold">{className}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-sm">{subjectName}</div>
                                            <div className="text-[10px] text-muted-foreground">{subjectCode}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                {present} / {total} Present
                                            </div>
                                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500" 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 cursor-default">
                                            View Details
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
