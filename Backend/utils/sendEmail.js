import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // Fallback: If no SMTP configuration is found, log to console
  if (!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
    console.log("==================================================");
    console.log(`[DEVELOPER EMAIL FALLBACK] Sending email to: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log("==================================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || "JobZee Support"} <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">${options.message.replace(/\n/g, "<br/>")}</div>`,
  };

  await transporter.sendMail(mailOptions);
};
