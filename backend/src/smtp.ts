import nodemailer from 'nodemailer';
import { SendEmailRequest } from './types';

export async function sendEmail(req: SendEmailRequest): Promise<void> {
  const transporter = nodemailer.createTransport({
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

  const mailOptions: nodemailer.SendMailOptions = {
    from: req.from,
    to: req.to,
    subject: req.subject,
    text: req.body,
  };

  if (req.inReplyTo) mailOptions.inReplyTo = req.inReplyTo;
  if (req.references) mailOptions.references = req.references;

  await transporter.sendMail(mailOptions);
}
