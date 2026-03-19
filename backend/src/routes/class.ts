import express from 'express';
import { createClass } from '../controllers/class';
import { protect, authorize } from '../middleware/auth';


const  classRouter = express.Router();

classRouter.post('/create',createClass)

export default classRouter;