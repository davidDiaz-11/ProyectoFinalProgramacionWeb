// src/utils/mailer.js
const axios = require("axios");
const fs = require("fs");

async function sendEmail({ to, subject, html, attachments }) {
  try {
    const payload = {
      sender: {
        email: "diazdavid3477@gmail.com", // Remitente verificado en Brevo
        name: "UrbanFit Store",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    // ================================
    // 🔵 Adjuntar ARCHIVOS (buffer o path)
    // ================================
    if (attachments && attachments.length > 0) {
      payload.attachment = attachments.map((att) => {
        // 🟣 Caso 1: PDF EN MEMORIA (BUFFER)
        if (att.buffer) {
          return {
            name: att.filename,
            content: att.buffer.toString("base64"),
          };
        }

        // 🟡 Caso 2: PDF en archivo físico (PATH)
        if (att.path) {
          const fileContent = fs.readFileSync(att.path);
          return {
            name: att.filename,
            content: fileContent.toString("base64"),
          };
        }

        throw new Error("Cada attachment debe tener 'buffer' o 'path'");
      });
    }

    // ================================
    // Enviar email por Brevo
    // ================================
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
