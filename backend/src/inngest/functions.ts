import "dotenv/config"; // ✅ VERY IMPORTANT

import mongoose from "mongoose";
import { inngest } from "./index";
import Class from "../models/class";
import User from "../models/user";
import Timetable from "../models/timetable";
import Exam from "../models/exams";
import Subject from "../models/subject";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { generateText } from "ai";
import { type Request, type Response } from "express";

interface GenSettings {
  startTime: string;
  endTime: string;
  periods: number;
}

export const generateTimetable = inngest.createFunction(
  {
    id: "generate-timetable",
    triggers: [{ event: "app/generate.timetable" }],
  },
  async ({ event, step }) => {
    const { classId, academicYear, settings } = event.data as {
      classId: string;
      academicYear: string;
      settings: GenSettings;
    };

    // ================= FETCH DATA =================
    const contextData = await step.run("fetch-class-data", async () => {
      const classData = await Class.findById(classId).populate("subjects");

      if (!classData) {
        throw new NonRetriableError(`Class with ID ${classId} not found`);
      }

      const allTeachers = await User.find({ role: "teacher" });

      const subjectIds = classData.subjects.map((s: any) =>
        s._id.toString()
      );

      const teachers = allTeachers
        .filter((t: any) =>
          t.teacherSubjects?.some((sub: any) =>
            subjectIds.includes(sub.toString())
          )
        )
        .map((t: any) => ({
          _id: t._id.toString(),
          name: t.name,
          subjects: t.teacherSubjects.map((s: any) => s.toString()),
        }));

      const subjects = classData.subjects.map((s: any) => ({
        _id: s._id.toString(),
        name: s.name,
        code: s.code,
      }));

      // Fetch all existing timetables for conflict checking
      const allTimetables = await Timetable.find({ academicYear })
        .populate("class")
        .populate("schedule.periods.subject")
        .populate("schedule.periods.teacher");

      return {
        className: classData.name,
        subjects,
        teachers,
        allTimetables,
      };
    });

    // ================= AI GENERATION =================
    const aiSchedule = await step.run("generate-ai-timetable", async () => {

      // ✅ DEBUG (remove in production)
      console.log(
        "ENV KEY:",
        process.env.GOOGLE_GENERATIVE_AI_API_KEY
      );

      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new NonRetriableError(
          "GOOGLE_GENERATIVE_AI_API_KEY is not set"
        );
      }

      const sampleSubjectId = contextData.subjects[0]?._id || "60d5ecb8b392d75e0c5e40a1";
      const sampleTeacherId = contextData.teachers[0]?._id || "60d5ecb8b392d75e0c5e40b2";

      const prompt = `
You are a school scheduler. Generate a weekly timetable (Monday to Friday).

CONTEXT:
- Class: \${contextData.className}
- Hours: \${settings.startTime} to \${settings.endTime} (\${settings.periods} periods per day)

RESOURCES:
- Subjects: \${JSON.stringify(contextData.subjects)}
- Teachers: \${JSON.stringify(contextData.teachers)}
- Other Timetables: \${JSON.stringify(contextData.allTimetables)}

STRICT RULES:
1. Assign a teacher to every subject period, ensuring they are qualified to teach that subject.
2. Teacher Must have the subject ID in their List.
3. Avoid scheduling the same teacher for multiple classes at the same time.
4. Break Time/Free period after every 2 periods (10 minutes break), lunch Time after 5 periods (at 12:00) (30 minutes break).
5. Avoid clashes with other classes (teachers can't be in two places at once).
6. Output strict JSON only. NEVER output markdown wrapping blocks.
7. CRITICAL DB SCHEMA ENFORCEMENT: For the 'subject' and 'teacher' properties, you MUST supply EXACTLY the 24-character hex \`_id\` string from the provided RESOURCES lists! DO NOT supply the Subject Name or Teacher Name. (e.g. "subject": "60d5ecb8b392...", NOT "subject": "Mathematics")

SCHEMA:
{
  "schedule": [
    {
      "day": "Monday",
      "periods": [
        {
          "type": "class",
          "subject": "${sampleSubjectId}",
          "teacher": "${sampleTeacherId}",
          "startTime": "HH:MM",
          "endTime": "HH:MM"
        },
        {
          "type": "break",
          "startTime": "HH:MM",
          "endTime": "HH:MM"
        }
      ]
    }
  ]
}

8. When there is a holiday or a teacher is unavailable, mark the period as "Holiday" or "Unavailable" with no teacher assigned.
9. Ensure that the generated timetable is unique and does not duplicate existing timetables for the same academic year.
10. Classes must end at 16:00 everyday.
11. Include breaks in the schedule: 10-minute breaks after every 2 periods, 30-minute lunch at 12:00.
`;

      // ✅ CORRECT USAGE (reads from ENV automatically)
      const model = google("gemini-3-flash-preview");

      const { text } = await generateText({
        model,
        prompt,
      });

      console.log("🧠 AI RAW:", text);

      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        return JSON.parse(clean);
      } catch (err) {
        console.error("❌ JSON Parse Error:", clean);
        throw new NonRetriableError("Invalid AI JSON");
      }
    });

    // ================= SAVE =================
    await step.run("save-timetable", async () => {
      await Timetable.findOneAndDelete({
        class: classId,
        academicYear,
      });

      const validSubjects = contextData.subjects.map((s: any) => s._id);

      const schedule = (aiSchedule.schedule || []).map((day: any) => ({
        day: day.day,
        periods: (day.periods || [])
          .filter(
            (p: any) =>
              p.type === "break" ||
              (validSubjects.includes(p.subject) &&
                mongoose.Types.ObjectId.isValid(p.subject))
          )
          .map((p: any) => ({
            type: p.type || "class",
            subject: p.type === "break" ? undefined : new mongoose.Types.ObjectId(p.subject),
            teacher:
              p.teacher && mongoose.Types.ObjectId.isValid(p.teacher)
                ? new mongoose.Types.ObjectId(p.teacher)
                : undefined,
            startTime: p.startTime,
            endTime: p.endTime,
          })),
      }));

      if (!schedule.length) {
        throw new NonRetriableError("Generated schedule is empty");
      }

      await Timetable.create({
        class: classId,
        academicYear,
        schedule,
      });

      return { success: true };
    });

    return { message: "✅ Timetable generated successfully" };
  }
);

// ================= GET TIMETABLE =================

export const getTimetable = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;

    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    if (!academicYear || typeof academicYear !== "string") {
      return res.status(400).json({ message: "academicYear is required" });
    }

    const timetable = await Timetable.findOne({
      class: classId,
      academicYear,
    })
      .populate("class")
      .populate("schedule.periods.subject")
      .populate("schedule.periods.teacher");

    if (!timetable) {
      return res.status(404).json({
        message:
          "Timetable not found for the specified class and academic year",
      });
    }

    return res.status(200).json(timetable);
  } catch (error) {
    console.error("❌ Error fetching timetable:", error);
    return res.status(500).json({ message: "Error fetching timetable" });
  }
};

// ================= OTHER INNGEST FUNCTIONS (e.g., exam generation) can be added here =================

//@desc generate exams using AI
//@route POST /api/exams/generate   
//@access Private (admin only)

export const generateExam = inngest.createFunction(
  {
    id: "generate-exam",
    triggers: [{ event: "app/generate.exam" }],
  },
  async ({ event, step }) => {
    const {
      examId,
      title,
      subject,
      class: classId,
      teacher,
      duration,
      dueDate,
      topic,
      difficulty,
      count,
    } = event.data;

    // ================= FETCH BASIC DATA =================
    const contextData = await step.run("fetch-exam-context", async () => {
      const classData = await Class.findById(classId);
      const subjectData = await Subject.findById(subject);
      const teacherData = await User.findById(teacher);

      if (!classData || !subjectData || !teacherData) {
        throw new NonRetriableError("Invalid class/subject/teacher");
      }

      return {
        className: classData.name,
        subjectName: subjectData.name,
        teacherName: teacherData.name,
      };
    });

    // ================= AI GENERATION =================
    const generatedData = await step.run("generate-exam-logic", async () => {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!apiKey) {
        throw new NonRetriableError("GOOGLE_GENERATIVE_AI_API_KEY is missing");
      }

      const prompt = `
You are a highly experienced academic examiner and curriculum expert.

EXAM CONTEXT:
- Class: ${contextData.className}
- Subject: ${contextData.subjectName}
- Topic: ${topic}
- Difficulty Level: ${difficulty}
- Total Questions: ${count}

RULES:
1. Generate EXACTLY ${count} questions distributed across 3 sections: Section 1 (MCQ), Section 2 (Short Answer), and Section 3 (Long Answer).
2. For MCQ: Provide exactly 4 distinct options with plausible distractors, and ONLY ONE strictly correct answer.
3. For SHORT_ANSWER and LONG_ANSWER: Provide no options.
4. Distribute marks reasonably (e.g., MCQ=1 mark, SHORT_ANSWER=2-5 marks, LONG_ANSWER=10+ marks).
5. Ensure all questions are valid, directly related to the topic, and form a proper exam paper.
6. No repetition of questions.
7. Output STRICT JSON ONLY.

FORMAT:
{
  "questions": [
    {
      "question": "text",
      "type": "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"], /* only for MCQ */
      "correctAnswer": "Option 1", /* exactly matching one option for MCQ, or text for others */
      "marks": 5
    }
  ]
}
`;

      const google = createGoogleGenerativeAI({ apiKey });
      const model = google("gemini-3-flash-preview");

      const { text } = await generateText({ model, prompt });

      console.log("🧠 AI RAW:", text);

      const clean = text.replace(/```json|```/g, "").trim();

      try {
        return JSON.parse(clean);
      } catch (err) {
        console.error("❌ JSON Parse Error:", clean);
        throw new NonRetriableError("Invalid AI JSON");
      }
    });

    // ================= SAVE (CREATE EXAM) =================
    const savedExam = await step.run("create-exam", async () => {
      if (!generatedData.questions || !Array.isArray(generatedData.questions)) {
        throw new NonRetriableError("Invalid AI response format");
      }

      const formattedQuestions = generatedData.questions.map((q: any) => {
        let type = "SHORT_ANSWER";
        const incomingType = q.type?.toUpperCase();
        if (incomingType === "MCQ") type = "MCQ";
        else if (incomingType === "LONG_ANSWER") type = "LONG_ANSWER";

        return {
          questionText: q.question,
          type,
          options: type === "MCQ" ? q.options || [] : undefined,
          correctAnswer: q.correctAnswer,
          points: q.marks || 1,
        };
      });

      if (!formattedQuestions.length) {
        throw new NonRetriableError("Generated questions are empty");
      }

      const exam = await Exam.findByIdAndUpdate(examId, {
        questions: formattedQuestions,
        isActive: true,
      }, { new: true });

      if (!exam) {
        throw new NonRetriableError("Draft exam not found to update");
      }

      return exam;
    });

    return {
      message: "✅ Exam generated and created successfully",
      examId: savedExam._id,
    };
  }
);