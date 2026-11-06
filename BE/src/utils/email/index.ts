import nodemailer from "nodemailer"
import { devConfig } from "../../config/dev.env";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
export const sendEmail = async (mailOptions: MailOptions) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        auth: {
            user: devConfig.SMTP_EMAIL,
            pass: devConfig.SMTP_PASSWORD,
        },
    });
    await transporter.sendMail(mailOptions);
}