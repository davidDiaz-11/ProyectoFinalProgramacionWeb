const axios = require("axios");

async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    // Convertir attachments a formato Brevo
    const brevoAttachments = attachments.map((att) => ({
      name: att.filename,
      content: att.content.toString("base64"), // PDF en base64
    }));

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: "diazdavid3477@gmail.com", // remitente verificado en Brevo
          name: "UrbanFit Store",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        attachment: brevoAttachments, // 👈 AQUÍ SE ENVIAN LOS PDF
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
