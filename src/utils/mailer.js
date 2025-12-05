const axios = require("axios");
const fs = require("fs");

async function sendEmail({ to, subject, html, attachments }) {
  try {
    const payload = {
      sender: {
        email: "no-reply@brevo.com",
        name: "UrbanFit Store",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    // Adjuntar archivos correctamente
    if (attachments && attachments.length > 0) {
      payload.attachment = attachments.map((att) => {
        const fileContent = fs.readFileSync(att.path); // Leer archivo PURO

        return {
          name: att.filename,
          content: fileContent.toString("base64"),
        };
      });
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
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
