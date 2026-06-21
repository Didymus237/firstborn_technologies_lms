import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Attendance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Filter, Calendar, FileText, UserCheck, XCircle, Clock, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AttendanceAdminReports = () => {
    const [reports, setReports] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Attendance | null>(null);
    
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    
    const [filters, setFilters] = useState({
        classId: "all",
        subjectId: "all",
        startDate: "",
        endDate: ""
    });

    useEffect(() => {
        // Load initial classes and subjects for filters
        Promise.all([
            api.get("/classes"),
            api.get("/subjects")
        ]).then(([classesRes, subjectsRes]) => {
            setClasses(classesRes.data.data || []);
            setSubjects(subjectsRes.data || []);
        }).catch(err => console.error("Failed to load filter data", err));

        fetchReports();
    }, []);

    const fetchReports = () => {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.classId !== "all") queryParams.append("classId", filters.classId);
        if (filters.subjectId !== "all") queryParams.append("subjectId", filters.subjectId);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);

        api.get(`/attendance/admin/reports?${queryParams.toString()}`)
            .then(res => setReports(res.data))
            .catch(err => console.error("Failed to load attendance reports", err))
            .finally(() => setLoading(false));
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm border-primary/10">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Report Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Class</Label>
                            <Select value={filters.classId} onValueChange={(v) => handleFilterChange("classId", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select value={filters.subjectId} onValueChange={(v) => handleFilterChange("subjectId", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>From</Label>
                            <Input type="date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>To</Label>
                            <Input type="date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
                        </div>
                        <Button onClick={fetchReports} className="w-full">
                            <Search className="h-4 w-4 mr-2" /> Filter
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden border-none bg-background">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="font-bold">Subject</TableHead>
                                <TableHead className="font-bold">Class</TableHead>
                                <TableHead className="font-bold">Teacher</TableHead>
                                <TableHead className="font-bold">Roster Info</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No reports found for the selected criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report._id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                {new Date(report.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-primary">{(report.subjectId as any)?.name}</div>
                                            <div className="text-[10px] text-muted-foreground">{(report.subjectId as any)?.code}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{(report.classId as any)?.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{(report.markedBy as any)?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-green-600 font-bold">{report.records.filter(r => r.status === 'Present').length} P</span>
                                                <span className="text-destructive font-bold">{report.records.filter(r => r.status === 'Absent').length} A</span>
                                                <span className="text-muted-foreground">/ {report.records.length} Total</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 text-xs hover:bg-primary/10 text-primary"
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                <FileText className="h-3.5 w-3.5 mr-1" /> View Records
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                             <UserCheck className="h-5 w-5 text-primary" />
                             Attendance Roster Details
                        </DialogTitle>
                        <div className="flex flex-col text-sm text-muted-foreground mt-1">
                             <div className="flex items-center gap-1 font-medium text-foreground">
                                {selectedReport && (selectedReport.subjectId as any)?.name} | {selectedReport && (selectedReport.classId as any)?.name}
                             </div>
                             <div>{selectedReport && new Date(selectedReport.date).toDateString()}</div>
                        </div>
                    </DialogHeader>
                    
                    <ScrollArea className="max-h-[60vh] mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedReport?.records.map((rec: any, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="py-2">
                                            <div className="font-medium">{(rec.student as any)?.name || "Unknown"}</div>
                                            <div className="text-[10px] text-muted-foreground">{(rec.student as any)?.email}</div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            {rec.status === 'Present' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200">Present</Badge>}
                                            {rec.status === 'Absent' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-red-200">Absent</Badge>}
                                            {rec.status === 'Late' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-amber-200">Late</Badge>}
                                            {rec.status === 'Excused' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none border-blue-200">Excused</Badge>}
                                        </TableCell>
                                        <TableCell className="py-2 text-xs italic text-muted-foreground">
                                            {rec.remarks || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};
