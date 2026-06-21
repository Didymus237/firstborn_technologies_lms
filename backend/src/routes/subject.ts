import express from 'express';
import { createSubject, deleteSubject, updateSubject, getAllSubjects, assignSubjectToClass } from '../controllers/subject';
import { protect, authorize } from '../middleware/auth';

const subjectRouter = express.Router();

// Require authentication + admin role for subject creation
subjectRouter.post('/create', protect, authorize(['admin']), createSubject);
subjectRouter.get('/', protect, getAllSubjects); // allow authenticated users to view subjects
subjectRouter.put('/:id', protect, authorize(['admin']), updateSubject);
subjectRouter.put('/update/:id', protect, authorize(['admin']), updateSubject); // legacy client support
subjectRouter.delete('/:id', protect, authorize(['admin']), deleteSubject);
subjectRouter.delete('/delete/:id', protect, authorize(['admin']), deleteSubject); // legacy client support
subjectRouter.post('/:id/assign-class', protect, authorize(['admin']), assignSubjectToClass); // Assign subject to class

export default subjectRouter;