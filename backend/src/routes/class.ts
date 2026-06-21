import express from 'express';
import { createClass, updateClass, deleteClass, getAllClasses, getClassById } from '../controllers/class';
import { protect, authorize } from '../middleware/auth';

const classRouter = express.Router();

// Require authentication + admin role for class operations
classRouter.post('/create', protect, authorize(['admin']), createClass);
classRouter.put('/:id', protect, authorize(['admin']), updateClass);
classRouter.put('/update/:id', protect, authorize(['admin']), updateClass); // legacy client support
classRouter.delete('/:id', protect, authorize(['admin']), deleteClass);
classRouter.delete('/delete/:id', protect, authorize(['admin']), deleteClass); // legacy client support
classRouter.get('/', protect, getAllClasses); // allow authenticated users to view classes
classRouter.get('/:id', protect, getClassById); 

export default classRouter;