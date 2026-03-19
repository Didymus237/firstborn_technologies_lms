import express from 'express';
import { getAllActivities } from '../controllers/activitieslog';

import { protect, authorize } from '../middleware/auth';

const LogsRouter = express.Router();

LogsRouter.get('/', 
     protect ,
     authorize(['admin', 'teacher', 'student']),
    getAllActivities 
);

export default LogsRouter;