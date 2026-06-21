import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import OfferTemplate from '../models/offerTemplate';
import OfferLog from '../models/offerLog';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Fetch all templates
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await OfferTemplate.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (error) {
        console.error("Error fetching templates:", error);
        res.status(500).json({ message: 'Server Error Fetching Templates' });
    }
};

// Create Template (seed initial ones easily)
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { name, type, subjectLine, body } = req.body;
        const newTemplate = await OfferTemplate.create({ name, type, subjectLine, body });
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error("Error creating template:", error);
        res.status(500).json({ message: 'Server Error Creating Template' });
    }
};

// Send Offer Email Endpoint
export const sendOfferLetter = async (req: Request, res: Response) => {
    try {
        const { recipientEmail, recipientName, userId, templateId, pdfBase64, subjectLine, bodyMessage } = req.body;

        if (!recipientEmail || !pdfBase64) {
            res.status(400).json({ message: 'Recipient email and PDF data are required natively.' });
            return;
        }

        // Generate unique cryptographic Reference Number
        const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
        const year = new Date().getFullYear();
        const referenceNumber = `OFFER-${year}-${hash}`;

        // Setup Nodemailer Transport (Mock SMTP / Dev SMTP config)
        // In physical production, replace this with secure ENV variables
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER || 'test@firstborn.edu',
                pass: process.env.SMTP_PASS || 'password'
            }
        });

        // Strip the data:application/pdf base64 header if included from React
        const base64Data = pdfBase64.replace(/^data:application\/pdf;filename=.*?;base64,/, '')
            .replace(/^data:application\/pdf;base64,/, '');

        const attachBuffer = Buffer.from(base64Data, 'base64');

        // Fire Email
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Firstborn Academy HR" <hr@firstborn.edu>',
            to: recipientEmail,
            subject: subjectLine || `Official Offer Letter: ${referenceNumber}`,
            html: bodyMessage || `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Dear ${recipientName},</h2>
                    <p>Congratulations! We are thrilled to extend this official offer to you.</p>
                    <p>Please find your detailed offer letter attached as a highly secure PDF. Review the documented terms and structural limits mapped inside.</p>
                    <br/>
                    <p>Best Regards,</p>
                    <p><strong>Firstborn Academy Administration</strong></p>
                    <p style="font-size: 11px; color: #888;">Reference: ${referenceNumber}</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Offer_Letter_${referenceNumber}.pdf`,
                    content: attachBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        // We aren't failing execution if the email throws error locally because SMTP might not be configured. 
        // We will log the attempt regardless.
        let mailResult;
        let errorMessage = '';
        let dispatchStatus: 'sent' | 'failed' = 'failed';

        try {
            mailResult = await transporter.sendMail(mailOptions);
            dispatchStatus = 'sent';
        } catch (mailError: any) {
            console.error("SMTP Transport failed:", mailError);
            errorMessage = mailError.message;
            // Native fallback allowing pipeline to proceed since we are lacking physical env keys
        }

        // Secure state to DB
        const log = await OfferLog.create({
            referenceNumber,
            recipientName,
            recipientEmail,
            userId: userId || null,
            templateId: templateId || null,
            status: dispatchStatus,
            errorMessage
        });

        if (dispatchStatus === 'sent') {
            res.status(200).json({ message: 'Offer Letter Dispatched Successfully.', referenceNumber, logId: log._id });
        } else {
            // Still respond 200 for logical flow if SMTP isn't wired physically, but warn client.
            res.status(200).json({ message: 'Offer Generated. SMTP transport failed (Verify physical ENV variables).', referenceNumber, logId: log._id, warning: true });
        }

    } catch (error) {
        console.error("Error formatting dispatcher:", error);
        res.status(500).json({ message: 'Server Error executing SMTP pipeline' });
    }
};

// Generate Offer Letter using AI
export const generateOfferLetterAI = async (req: Request, res: Response) => {
    try {
        const { name, role, department, salary, joiningDate, additionalContext } = req.body;

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ message: "GOOGLE_GENERATIVE_AI_API_KEY is missing natively." });
            return;
        }

        const prompt = `
You are a highly experienced Human Resources Director for Firstborn Academy, an elite institution.
Write a highly professional, pristine, and inspiring Offer Letter for an incoming candidate.

CANDIDATE DETAILS:
- Name: ${name || 'The Candidate'}
- Role: ${role || 'Member'}
- Department: ${department || 'General Assignments'}
- Compensation/Status: ${salary || 'Standard Standard'}
- Joining Date: ${joiningDate || 'Immediate'}
${additionalContext ? `- Extra Context: ${additionalContext}` : ''}

RULES:
1. Output ONLY the raw letter text (no markdown wrapping, no JSON). Keep whitespace/paragraphs intact.
2. The tone must be intensely professional, welcoming, corporate, and elegant.
3. Start directly with "Dear ${name || 'Candidate'}," and end with a professional sign-off structurally supporting a blank signature line.
4. Keep the letter to about 3 or 4 paragraphs. Emphasize how their background perfectly aligns with the advanced matrix of Firstborn Academy.
        `;

        const google = createGoogleGenerativeAI({ apiKey });
        const model = google("gemini-3-flash-preview");

        const { text } = await generateText({ model, prompt });
        res.status(200).json({ text: text.trim() });

    } catch (error) {
        console.error("AI Generation failed:", error);
        res.status(500).json({ message: 'Server Error invoking Generative pipelines' });
    }
};
