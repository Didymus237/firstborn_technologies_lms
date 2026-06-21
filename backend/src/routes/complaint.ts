import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { 
    createComplaint, 
    getComplaints, 
    updateComplaintStatus, 
    addComplaintResponse, 
    deleteComplaint 
} from '../controllers/complaint';

const router = express.Router();

// Middleware ensuring only authenticated users can access the Helpdesk routes
router.use(protect);

router.route('/')
    .post(authorize(['student']), createComplaint)
    .get(getComplaints); // Admin, Teacher, Student all share GET endpoint resolving implicitly

router.route('/:id')
    .delete(authorize(['student']), deleteComplaint);

router.route('/:id/status')
    .put(authorize(['admin', 'teacher']), updateComplaintStatus);

router.route('/:id/reply')
    .post(addComplaintResponse);

export default router;
