import express from 'express';
import { 
    markAttendance, 
    getAttendanceByClass, 
    getStudentAttendance, 
    getAttendanceAnalytics,
    getTeacherAttendanceSummary,
    getAdminAttendanceReports
} from '../controllers/attendance';
import { protect, authorize } from '../middleware/auth';

const attendanceRouter = express.Router();

// Only admin and teacher can mark attendance
attendanceRouter.post('/', protect, authorize(['admin', 'teacher']), markAttendance);

// View class attendance (optionally filtered by subject)
attendanceRouter.get('/class/:classId', protect, authorize(['admin', 'teacher']), getAttendanceByClass);

// View individual student attendance history
attendanceRouter.get('/student/:studentId', protect, getStudentAttendance);

// Get subject-wise attendance analytics for a student
attendanceRouter.get('/analytics/:studentId', protect, getAttendanceAnalytics);

// Get summary for a teacher
attendanceRouter.get('/teacher/summary', protect, authorize(['admin', 'teacher']), getTeacherAttendanceSummary);

// Admin Reports
attendanceRouter.get('/admin/reports', protect, authorize(['admin']), getAdminAttendanceReports);

export default attendanceRouter;
