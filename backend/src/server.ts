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

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

//next add security middlewares/headers + make sure to listen on *root file * for changes and restart the server automatically

//app.use(helmet()); //security middlewares/headers to set variouse HTTP headers for security
//app.use(helmet()); //security middlewares/headers to set variouse HTTP headers for security
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies
app.use(cookieParser()); // to parse cookies
app.use("/api/classes", classRouter); // Import class routes


//log http requests to the console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//cross origin resource sharing (CORS) to allow requests from different origins
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));


//health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({status: 'ok', message: 'Server is healthy' });
});

// IMPORT user routes

app.use('/api/users', userRoute); 
app.use("/api/activities", LogsRouter);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/classes", classRouter); // Import academic year routes


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