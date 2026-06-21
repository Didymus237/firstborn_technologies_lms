import express from 'express';
import { getDashboardStats } from '../controllers/dashboard';
import { protect } from '../middleware/auth';

const dashboardRouter = express.Router();

// Get the dashboard statistics for the logged in user
dashboardRouter.get('/stats', protect, getDashboardStats);


export default dashboardRouter;
