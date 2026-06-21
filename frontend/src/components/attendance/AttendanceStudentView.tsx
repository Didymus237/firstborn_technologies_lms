import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { StudentAttendanceSummary } from "./StudentAttendanceSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Loader2 } from "lucide-react";

export const AttendanceStudentView = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            api.get(`/attendance/student/${user._id}`)
                .then(res => setHistory(res.data))
                .catch(err => console.error("Failed to load attendance history", err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present": return "bg-green-100 text-green-700 border-green-200";
            case "Absent": return "bg-red-100 text-red-700 border-red-200";
            case "Late": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Excused": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-8">
            <section>
                <div className="flex items-center gap-2 mb-4 text-[#8B1E1E]">
                    <BookOpen className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Subject-Wise Analytics</h2>
                </div>
                <StudentAttendanceSummary />
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4 text-[#8B1E1E]">
                    <Calendar className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Attendance History</h2>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Detailed Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-[#8B1E1E]" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                <p>No detailed records found yet.</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Date</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Marked By</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(record.date).toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {record.subject?.name || "General"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusColor(record.status)} border shadow-none`}>
                                                        {record.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {record.markedBy?.name || "System"}
                                                </TableCell>
                                                <TableCell className="text-sm italic">
                                                    {record.remarks || "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
};
