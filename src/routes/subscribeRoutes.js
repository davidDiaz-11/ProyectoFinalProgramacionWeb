const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/mailer");

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const couponCode = "URBANFIT10";

    const htmlContent = `
      <div style="font-family:Arial; padding:20px; text-align:center;">
          <img src="https://urbanfitstoreisc.netlify.app/img/logo.jpg" width="150"/>

          <h2 style="color:#4CAF50;">¡Bienvenido a UrbanFit Store!</h2>
          <p>Estilo que te mueve.</p>
          <p>Gracias por suscribirte.</p>

          <h3 style="margin-top:20px;">Tu cupón de descuento</h3>
          <div style="
              font-size:24px;
              font-weight:bold;
              background:#4CAF50;
              color:white;
              display:inline-block;
              padding:12px 25px;
              border-radius:10px;
              margin-top:10px;
          ">
              ${couponCode}
          </div>

          <p style="margin-top:20px;">Úsalo en tu próxima compra para obtener un 10% de descuento.</p>
      </div>
    `;

    console.log("EMAIL DE SUSCRIPCION:", email);
    await sendEmail({
      to: email,
      subject: "Tu cupón exclusivo de UrbanFit Store",
      html: htmlContent,
    });

    res.json({ message: "Cupón enviado a tu correo" });
  } catch (error) {
    console.error("Error enviando cupón:", error);
    console.error("❌ ERROR SUSCRIPCION:", error.response?.data || error);
    res.status(500).json({ message: "Error al enviar cupón" });
  }
});

module.exports = router;
