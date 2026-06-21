import { type Request, type Response } from "express";
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import User from '../models/user';
import Attendance from '../models/attendance';

export const handleChatQuery = async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Messages array is required." });
        }

        // Initialize Gemini securely with a fallback catch if env fails
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'MISSING_KEY',
        });

        // Identify the user explicitly from the optional auth middleware
        const user = (req as any).user;

        // Formulate the master System Prompt dictating conversational behaviors
        let systemPrompt = `You are "Firstborn Technologies Assistant", the official AI Chatbot for the Firstborn Technologies portal.
Your primary role is acting as a deeply intelligent, fast, and multi-lingual SaaS Assistant.
Always respond in the precise language the user opens with! (e.g. Hindi replies to Hindi, English to English).
Maintain a clean, modern, professional tone. If they are encountering errors, calmly instruct them.

--- CORE PLATFORM NAVIGATION MAP ---
- Finance/Fees: User can find receipts, track ledgers, and pay fees under the "Finance" sidebar tab.
- Academics: Users can view their Attendance, Class schedules, and Report Cards under "Academics".
- LMS (Learning): Study materials, grading, and exams are located under "Learning (LMS)".
- Helpdesk: Under "Helpdesk", users can file complaints or manage leave requests.
- Admin: Only administrators can access settings, people management, and admission leads.
-----------------------------------
`;

        // Inject Dynamic RBAC Contexts into the invisible LLM background memory
        if (user) {
            systemPrompt += `\n\n--- ACTIVE USER CONTEXT ---\n`;
            systemPrompt += `You are actively speaking to: ${user.name}\n`;
            systemPrompt += `Their system role is: ${user.role}\n`;

            if (user.role === 'student') {
                systemPrompt += `Behavior: Be extremely helpful and warm. Address them by their first name naturally.\n`;

                // Aggregating live Database metrics exclusively for the student
                try {
                    const latestAttendance = await Attendance.find({ "records.student": user._id });
                    let present = 0;
                    let total = 0;
                    latestAttendance.forEach(day => {
                        const record = day.records.find((r: any) => r.student.toString() === user._id.toString());
                        if (record) {
                            total++;
                            if (record.status === 'Present' || record.status === 'Late') present++;
                        }
                    });

                    if (total > 0) {
                        const score = ((present / total) * 100).toFixed(1);
                        systemPrompt += `Vital System Stat - Their current live Attendance Rate is: ${score}%.\n`;
                    } else {
                        systemPrompt += `Vital System Stat - They have no verified attendance records yet.\n`;
                    }
                } catch (e) {
                    console.error("Attendance context load failed", e);
                }
            }
            else if (user.role === 'teacher') {
                systemPrompt += `Behavior: You are speaking to a staff member. Remind them they can take attendance or grade exams in their dedicated Academic portals. Keep responses highly efficient.\n`;
            }
            else if (user.role === 'admin') {
                systemPrompt += `Behavior: You are speaking to a System Administrator. They have full structural access. Provide authoritative overviews of system metrics if asked, and never restrict them.\n`;
            }
        } else {
            systemPrompt += `\n\n--- ACTIVE USER CONTEXT ---\nThe user is an anonymous guest browsing the public Landing Page. Your primary goal is to guide them to submit an "Admission Lead" form or explore the offered courses if they show interest.\n`;
        }

        // Convert UI messages (with parts) to Core messages (for streamText)
        const coreMessages = (messages || []).map((m: any) => {
            let content = m.content || "";
            if (!content && m.parts) {
                content = m.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('');
            }
            return {
                role: m.role || 'user',
                content: content
            };
        });

        console.log(`[Chatbot] Core Messages:`, JSON.stringify(coreMessages, null, 2));

        const googleProvider = createGoogleGenerativeAI({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });



        let result;
        try {
            console.log(`[Chatbot] Calling streamText...`);
            result = await streamText({
                model: googleProvider('gemini-flash-latest'),
                messages: coreMessages,
                system: systemPrompt,
            });
            console.log(`[Chatbot] streamText call successful`);






        } catch (err) {
            console.error("[Chatbot streamText error]:", err);
            throw err;
        }

        console.log(`[Chatbot] Stream initiated. Result keys:`, Object.keys(result));

        console.log(`[Chatbot] Stream initiated. Result keys:`, Object.keys(result));

        console.log(`[Chatbot] Pumping UI message stream to response...`);
        try {
            // In AI SDK 4.0/6.0, use pipeUIMessageStreamToResponse for Express
            if ((result as any).pipeUIMessageStreamToResponse) {
                (result as any).pipeUIMessageStreamToResponse(res);
                console.log(`[Chatbot] pipeUIMessageStreamToResponse call successful`);
            } else {
                console.log(`[Chatbot] Falling back to pipeTextStreamToResponse`);
                (result as any).pipeTextStreamToResponse(res);
            }
        } catch (streamError) {
            console.error(`[Chatbot] Stream error:`, streamError);
            if (!res.headersSent) {
                res.status(500).json({ error: "Stream error" });
            }
        }



    } catch (error: any) {
        console.error("Chatbot Native Stream Error:", error);
        res.status(500).json({ error: "Failed to process AI query reliably." });
    }
};
