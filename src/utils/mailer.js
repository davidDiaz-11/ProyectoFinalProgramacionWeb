const axios = require("axios");

async function sendEmail({ to, subject, html, attachments }) {
  try {
    const payload = {
      sender: {
        email: "diazdavid3477@gmail.com", // remitente verificado
        name: "UrbanFit Store",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    // Solo agregar attachments si existen
    if (attachments && attachments.length > 0) {
      payload.attachment = attachments.map((att) => ({
        name: att.filename,
        content: att.content.toString("base64"),
      }));
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
