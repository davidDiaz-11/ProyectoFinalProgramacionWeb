// src/utils/mailer.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html, text }) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM, // ej: "UrbanFit Store <noreply@algo.com>"
      to,
      subject,
      html,
      text,
    });

    console.log("📨 Email enviado:", data.id || data);
    return data;
  } catch (err) {
    console.error("❌ Error enviando correo:", err);
    throw err;
  }
}

module.exports = { sendEmail };
