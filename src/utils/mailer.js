const axios = require("axios");

async function sendEmail({ to, subject, html }) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.EMAIL_FROM || "urbanfit@brevo.com" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📨 Email enviado vía Brevo:", response.data);
    return response.data;
  } catch (err) {
    console.error(
      "❌ Error enviando correo (Brevo):",
      err.response?.data || err
    );
    throw err;
  }
}

module.exports = { sendEmail };
