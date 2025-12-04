const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 👈 NECESARIO EN RAILWAY
  },
});


async function sendEmail({ to, subject, text, html, attachments = [] }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log("📨 Email enviado:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error enviando correo:", err);
    throw err;
  }
}

module.exports = { sendEmail };
