// let create a simple server using express

import cookieParser from 'cookie-parser';
import express from 'express';
import type { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';


import connectDB from './config/db';
import userRoute from './routes/user';
import LogsRouter from './routes/activitieslog';
import academicYearRouter from './routes/academicYear';
import classRouter from './routes/class';
import subjectRouter from './routes/subject';
import { serve } from "inngest/express";
import { inngest } from "./inngest";
import { generateExam, generateTimetable } from "./inngest/functions";
import timetableRouter from './routes/timetable';
import financeRouter from './routes/finance';
import attendanceRouter from './routes/attendance';
import dashboardRouter from './routes/dashboard';
import assignmentsRouter from './routes/assignments';
import materialsRouter from './routes/materials';
import { settingRouter } from './routes/settings';
import examsRouter from './routes/exams';
import idCardRoutes from './routes/idCard';
import offerRoutes from './routes/offer';
import publicRouter from './routes/public';
import receiptRoutes from './routes/receipt';
import complaintRoutes from './routes/complaint';
import leaveRoutes from './routes/leave';
import blogPostRoutes from './routes/blogPost';
import commentRoutes from './routes/comment';
import paymentRouter from './routes/payment';
import examTermRouter from './routes/examTerm';
import reportCardRouter from './routes/reportCard';
import uploadRouter from './routes/upload';
import inquiryRouter from './routes/inquiry';
import chatbotRouter from './routes/chatbot';
import expenseRouter from './routes/expense';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

//next add security middlewares/headers + make sure to listen on *root file * for changes and restart the server automatically

//app.use(helmet()); //security middlewares/headers to set variouse HTTP headers for security
//app.use(helmet()); //security middlewares/headers to set variouse HTTP// Middleware Configuration
app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.originalUrl.startsWith('/api/payment/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cross origin resource sharing (CORS) setup early to apply to all routes and static assets
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(`>>> ${req.method} ${req.originalUrl}`);
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable for now to ensure images load
}));

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Expose public files publicly with explicit CORS headers for client-side HTML canvas rendering
const uploadDir = path.resolve(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadDir, {
  setHeaders: (res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
  }
}));

// Log http requests to the console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


//health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// IMPORT user routes

app.use('/api/users', userRoute);
app.use("/api/activities", LogsRouter);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/classes", classRouter); // Import academic year routes
app.use("/api/subjects", subjectRouter); // Import subject routes
app.use("/api/timetables", timetableRouter);
app.use("/api/finance", financeRouter);
app.use("/api/exams", examsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/settings/school", settingRouter);
app.use("/api/public", publicRouter);
app.use('/api/id-cards/templates', idCardRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/blog', blogPostRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payment', paymentRouter);
app.use('/api/exam-terms', examTermRouter);
app.use('/api/report-cards', reportCardRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/inquiries', inquiryRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/expenses', expenseRouter);
app.use("/api/inngest", serve({ client: inngest, functions: [generateTimetable, generateExam] }));


//global error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});




//start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// "dev" : "nodemon --exec bun run index.ts",
//   "start": "bun --watch index.ts" ""