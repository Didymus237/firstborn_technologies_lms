import { type Request, type Response } from "express"
import { logActivity } from "../utils/activitieslog";
import Exam from "../models/exams";
import Subject from "../models/subject";
import { inngest } from "../inngest";
import Submission from "../models/submissions";

//@desc Trigger AI Exam generation
//@route POST /api/exams/generate
//@access Private (admin only)

export const triggerExamGeneration = async (req: Request, res: Response): Promise<void> => {

    try {
        const {
            title,
            subject,
            class: classId,
            duration,
            dueDate,
            topic,
            difficulty,
            count,
        } = req.body;

        const subjectDoc = await Subject.findById(subject);
        const teacherId = (req as any).user?._id;

        let parsedDuration = 60;
        if (duration) {
            parsedDuration = typeof duration === "string" ? parseInt(duration.replace(/\D/g, ""), 10) : duration;
            if (isNaN(parsedDuration)) parsedDuration = 60;
        }

        const draftExam = await Exam.create({
            title: title || `Auto-Generated: ${topic}`,
            subject,
            class: classId,
            teacher: teacherId,
            duration: parsedDuration,
            topic,
            difficulty: difficulty ? difficulty.toLowerCase() : "medium",
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default to 1 week later
            isActive: false, // will be activated once AI generation is done
            questions: [], // will be filled by AI
        });

        await logActivity({
            userId: (req as any).user?._id,
            action: "Triggered exam generation for subject"
        });
        await inngest.send({
            name: "app/generate.exam",
            data: {
                examId: draftExam._id.toString(),
                title: draftExam.title,
                subject: draftExam.subject.toString(),
                class: draftExam.class.toString(),
                teacher: draftExam.teacher.toString(),
                duration: draftExam.duration,
                dueDate: draftExam.dueDate.toISOString(),
                topic,
                subjectName: subjectDoc?.name || "Unknown Subject",
                difficulty: draftExam.difficulty,
                count: count ? parseInt(count.toString(), 10) : 10,
            },
        })
        res.status(200).json({ message: 'Exam generation requested successfully', examId: draftExam._id });

    } catch (error) {
        console.error('Error generating exam:', error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

//@desc const creat/Publish Exam
//@route POST /api/exams/

export const createExam = async (req: Request, res: Response): Promise<void> => {
    try {
        const exam = await Exam.create({
            ...req.body,
            teacher: (req as any).user?._id,
        })
        const userId = (req as any).user?._id;
        await logActivity({
            userId: userId,
            action: "Exam created successfully"
        });
        res.status(200).json({ message: 'Exam created successfully', exam });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });

    }
}

//@desc get Exams (students sees available , teacher sees created)
//@route GET /api/exams

export const getExams = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        let query = {};
        if (user.role === "student") {
            query = { class: user.studentClass, isActive: true };
        } else if (user.role === "teacher") {
            query = { teacher: user._id };
        }

        const exams = await Exam.find(query).populate("subject", "name").populate("class", "name section").select("-questions.correctAnswer")
        res.json(exams);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });

    }
}


//@desc get exam by id
//@route GET /api/exams/:id 

export const getExamById = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = req.params.id;
        const user = (req as any).user;
        let query = Exam.findById(examId).populate("subject", "name").populate("class", "name section").populate("teacher", "name email");
        if (user.role === "teacher" || user.role === "admin") {
            query = query.select("-questions.correctAnswer");
        }
        const exam = await query;
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        if (user.role === "student" && !exam.isActive) {
            return res.status(403).json({ message: "Exam is not active" });
        }

        //securirty check
        //ensure that student belongs to the class this exams is assigned to
        if (user.role === "student") {
            const examClassId = (exam.class as any)._id
                ? (exam.class as any)._id.toString()
                : exam.class.toString();

            if (String(user.studentClass) !== examClassId) {
                return res.status(403).json({ message: "Not authorized to access this exam" });
            }
        }
        res.json(exam);
    } catch (error) {
        console.error("Error fetching exam:", error);

        //handle invalid ID format (castError)
        if (error instanceof Error && error.name === "CastError") {
            return res.status(400).json({ message: "Invalid exam ID format" });
        }

        //handle other errors
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

//@desc Submit Exam and auto grade it
//@route POST /api/exams/:id/submit

export const submitExam = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = req.params.id as string;
        const studentId = (req as any).user?._id as string;
        const { answers } = req.body;

        //1. Fetch exam and validate
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        if (!exam.isActive) {
            return res.status(403).json({ message: "Exam is not active" });
        }

        //2. Prevent duplicate submissions
        const existingSubmission = await Submission.findOne({ exam: examId, student: studentId });
        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted this exam" });
        }

        //3. Validate answers
        const questionIds = exam.questions.map(q => q._id.toString());
        const submittedQuestionIds = Object.keys(answers);

        // Check if all questions are answered
        if (submittedQuestionIds.length !== questionIds.length) {
            return res.status(400).json({ message: "Not all questions have been answered" });
        }

        // Check if all submitted question IDs are valid
        const invalidQuestionIds = submittedQuestionIds.filter(id => !questionIds.includes(id));
        if (invalidQuestionIds.length > 0) {
            return res.status(400).json({ message: `Invalid question IDs: ${invalidQuestionIds.join(', ')}` });
        }

        //4. Auto-grade the submission
        let score = 0;
        const gradedAnswers = exam.questions.map(question => {
            const submittedAnswer = answers[question._id.toString()];
            const isCorrect = submittedAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();

            if (isCorrect) {
                score += 1;
            }

            return {
                question: question._id,
                answer: submittedAnswer,
                isCorrect,
                correctAnswer: question.correctAnswer,
            };
        });

        //5. Create submission record
        const submission = await Submission.create({
            exam: examId,
            student: studentId,
            answers: gradedAnswers,
            score,
        });

        //6. Log activity
        await logActivity({
            userId: studentId,
            action: "Exam submitted successfully",
            details: JSON.stringify({
                examId: examId.toString(),
                score: score,
                totalQuestions: exam.questions.length,
            }),
        });

        //7. Return submission with only necessary fields
        const populatedSubmission = await Submission.findById(submission._id)
            .populate("exam", "title duration")
            .populate("student", "name email")
            .select("-answers.correctAnswer");

        res.status(200).json({
            message: "Exam submitted successfully",
            submission: populatedSubmission,
        });

    } catch (error) {
        console.error("Error submitting exam:", error);

        // Handle invalid ID format
        if (error instanceof Error && error.name === "CastError") {
            return res.status(400).json({ message: "Invalid exam ID format" });
        }

        // Handle other errors
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

//@desc toggle exams status
//@route PUT /api/exams/:id/status

export const toggleExamStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = req.params.id as string;
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        exam.isActive = !exam.isActive;
        await exam.save();
        const message = exam.isActive ? "The exam is now active" : "The exam is now inactive";
        res.status(200).json({
            message,
            id: exam._id,
            isActive: exam.isActive,
        });
    } catch (error) {
        console.error("Error toggling exam status:", error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

//@desc Get Exam results (For student )
//@route GET /api/exams/:id/results

export const getExamResults = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = req.params.id as string;
        const studentId = (req as any).user?._id as string;
        const user = (req as any).user;

        //1. Fetch submission
        const submission = await Submission.findOne({ exam: examId, student: studentId })
            .populate("exam", "title duration subject class")
            .populate("student", "name email")
            .select("-answers.correctAnswer");

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        //2. Authorization check
        if (user.role === "student") {
            // Student can only see their own results
            const examClassId = (submission.exam as any).class._id
                ? (submission.exam as any).class._id.toString()
                : (submission.exam as any).class.toString();

            if (String(user.studentClass) !== examClassId) {
                return res.status(403).json({ message: "Not authorized to access this result" });
            }
        }

        // 3. Return results
        res.status(200).json({
            message: "Exam results fetched successfully",
            submission,
        });

    } catch (error) {
        console.error("Error fetching exam results:", error);

        // Handle invalid ID format
        if (error instanceof Error && error.name === "CastError") {
            return res.status(400).json({ message: "Invalid exam ID format" });
        }

        // Handle other errors
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

//@desc Delete Exam
//@route DELETE /api/exams/:id
//@access Private (admin, teacher)

export const deleteExam = async (req: Request, res: Response): Promise<any> => {
    try {
        const examId = req.params.id as string;
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        // Also delete any submissions tied to this exam
        await Submission.deleteMany({ exam: examId });
        await Exam.findByIdAndDelete(examId);

        const userId = (req as any).user?._id;
        await logActivity({
            userId: userId,
            action: `Exam (${exam.title}) deleted successfully`,
            details: `Deleted exam ${examId}`
        });

        res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}
