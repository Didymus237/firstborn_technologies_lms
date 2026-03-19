import  express from "express";
import { createAcademicYear, deleteAcademicYear, getAcademicYears, getCurrentAcademicYear, updateAcademicYear } from "../controllers/academicYear";
import { authorize, protect } from "../middleware/auth";


const academicYearRouter = express.Router();

academicYearRouter.post('/create', protect, authorize(['admin']), createAcademicYear);
academicYearRouter.get('/current', protect, authorize(['admin']), getCurrentAcademicYear);
academicYearRouter.get('/', protect, authorize(['admin']), getAcademicYears);
academicYearRouter.patch('/update/:id', protect, authorize(['admin']), updateAcademicYear);
academicYearRouter.delete('/delete/:id', protect, authorize(['admin']), deleteAcademicYear);


export default academicYearRouter;