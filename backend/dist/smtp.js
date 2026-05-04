"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendEmail(req) {
    const transporter = nodemailer_1.default.createTransport({
        host: req.smtpHost,
        port: req.smtpPort,
        secure: req.smtpPort === 465,
        auth: {
            user: req.email,
            pass: req.password,
        },
        tls: {
            rejectUnauthorized: false, // allow self-signed certs on cPanel servers
        },
    });
    const mailOptions = {
        from: req.from,
        to: req.to,
        subject: req.subject,
        text: req.body,
    };
    if (req.inReplyTo)
        mailOptions.inReplyTo = req.inReplyTo;
    if (req.references)
        mailOptions.references = req.references;
    await transporter.sendMail(mailOptions);
}
//# sourceMappingURL=smtp.js.map