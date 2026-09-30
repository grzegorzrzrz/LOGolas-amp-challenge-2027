import { JobStatus } from '../models/Job.js';
import Mail from "nodemailer/lib/mailer";
import nodemailer from "nodemailer";
import { stat } from "fs";

type EmailService = {
    sendJobCompletionNotification: (
        to: string,
        jobId: string,
        status: JobStatus,
        outputFilePath?: string
    ) => Promise<void>;
};

const sendJobCompletionNotification = async (
    to: string,
    jobId: string,
    status: JobStatus,
    outputFilePath?: string
): Promise<void> => {
    const subject = `APEX DB analysis completed`;
    let body = "";
    if (status === JobStatus.COMPLETED) {
        body = `Your analysis has completed successfully. Please find the results attached.`;
    } else {
        body = `Your analysis has failed. Please try again.`;
    }

    const message: Mail.Options = {
        from: "no-reply@apexdb.ai",
        to: to,
        subject: subject,
        text: body,
        attachments: [{
            filename: "results.csv",
            path: outputFilePath
        }]
    };

   await sendEmail(message);
};

// Helper functions ----------------------------------

async function sendEmail(message: Mail.Options) {
    const transporter = nodemailer.createTransport({
        host: "outbound.mailhop.org",
        secure: true,
        requireTLS: true,
        port: 465,
        auth: {
            user: process.env.EMAIL_PROVIDER_USERNAME,
            pass: process.env.EMAIL_PROVIDER_PASSWORD,
        }
    });

    try {
        const result = await transporter.sendMail(message);
        console.log("Email sent: " + result);
        return result;
    } catch (error: any) {
        console.log("error sending email:")
        console.log(error.message);
        throw error;
    }
}

const emailService: EmailService = {
    sendJobCompletionNotification
};


export default emailService; 