
// src/controllers/contactController.js
const { sendEmail } = require("../utils/mailer");

const ContactController = {
  async send(req, res) {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ message: "Nombre, correo y mensaje son obligatorios" });
      }

      const to = process.env.CONTACT_TO || process.env.EMAIL_USER;

      await sendEmail({
        to,
        subject: "Nuevo mensaje de contacto - UrbanFit",
        html: `
          <h2>Nuevo mensaje de contacto</h2>
          <p><b>Nombre:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Mensaje:</b></p>
          <p>${message}</p>
        `,
        text: `Nombre: ${name}\nEmail: ${email}\nMensaje:\n${message}`,
      });

      return res.json({ message: "Mensaje enviado correctamente" });
    } catch (err) {
      console.error("ERROR AL ENVIAR CORREO DE CONTACTO:", err);
      return res
        .status(500)
        .json({ message: "Error al enviar el mensaje de contacto" });
    }
  },
};

module.exports = ContactController;
