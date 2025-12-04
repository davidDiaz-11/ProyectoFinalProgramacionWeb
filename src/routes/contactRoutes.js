// backend/src/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/mailer");

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const now = new Date().toLocaleString();

    const htmlContent = `
      <div style="font-family:Arial; padding:20px;">
        <div style="text-align:center;">
          <img src="https://urbanfitstoreisc.netlify.app/img/logo.jpg" width="150"/>
          <h2 style="color:#4CAF50;">UrbanFit Store</h2>
          <p>"Estilo que te mueve."</p>
        </div>

        <p>Hola <strong>${name}</strong>,</p>
        <p>Hemos recibido tu mensaje y <strong>en breve serás atendido</strong>.</p>

        <p><strong>Fecha de recepción:</strong> ${now}</p>

        <h3>Tu mensaje:</h3>
        <blockquote style="background:#f5f5f5; border-left:4px solid #4CAF50; padding:10px;">
          ${message}
        </blockquote>

        <br>
        <p style="text-align:center;">Gracias por contactarnos.</p>
      </div>
    `;

    // Enviar correo al usuario
    await sendEmail({
      to: email,
      subject: "📩 Hemos recibido tu mensaje",
      html: htmlContent,
    });

    // (Opcional) Enviar copia al administrador
    await sendEmail({
      to: process.env.CONTACT_TO,
      subject: "Nuevo mensaje de contacto recibido",
      html: `
        <h3>Nuevo mensaje desde el formulario</h3>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mensaje:</b> ${message}</p>
        <p><i>Fecha:</i> ${now}</p>
      `,
    });

    return res.json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("ERROR AL ENVIAR CORREO DE CONTACTO:", error);
    return res.status(500).json({ message: "Error al enviar correo" });
  }
});

module.exports = router;
