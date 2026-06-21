import nodemailer from "nodemailer";

interface InquiryData {
    name: string;
    email: string;
    phone: string;
    course: string;
}

export const sendEmailAlert = async (data: InquiryData) => {
    try {
        // Create reusable transporter object using the default SMTP transport
        // NOTE: Admins must configure these standard ENV keys for the mailer to authenticate
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email structure styling
        const htmlBody = `
            <h2>New Inquiry Received!</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Interested Course:</strong> ${data.course}</p>
            <hr />
            <p><small>This is an automated system alert generated from Firstborn Technologies.</small></p>
        `;

        const info = await transporter.sendMail({
            from: `"System Alerts" <${process.env.SMTP_USER || "no-reply@example.com"}>`,
            to: "abet7674@gmail.com", // Target Administrator
            subject: `New Lead: ${data.name} - ${data.course}`,
            html: htmlBody,
        });

        console.log("Email Notification dispatched:", info.messageId);
        return true;
    } catch (error) {
        console.error("Failed to Dispatch Email Alert:", error);
        return false;
    }
};
