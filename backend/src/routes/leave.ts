import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { 
    createLeave, 
    getLeaves, 
    updateLeaveStatus, 
    cancelLeave 
} from '../controllers/leave';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize(['teacher']), createLeave)
    .get(authorize(['admin', 'teacher']), getLeaves);

router.route('/:id')
    .delete(authorize(['teacher']), cancelLeave);

router.route('/:id/status')
    .put(authorize(['admin']), updateLeaveStatus);

export default router;
