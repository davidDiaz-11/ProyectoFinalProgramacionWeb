// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const nodemailer = require("nodemailer");
const pool = require("../config/db");

const BLOCK_MINUTES = parseInt(process.env.BLOCK_MINUTES || "5", 10);

// ------------------------------
// TOKEN
// ------------------------------
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

const AuthController = {
  // ----------------------------------
  // REGISTRO
  // ----------------------------------
  async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !email || !password || !confirmPassword) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "Las contraseñas no coinciden" });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res
          .status(409)
          .json({ message: "El correo ya está registrado" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.createUser({
        name,
        email,
        passwordHash,
        passwordPlain: password
      });

      const token = generateToken(user);

      res.status(201).json({
        message: "Usuario registrado correctamente",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (err) {
      console.error("Error en register:", err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  // ----------------------------------
  // LOGIN (CON BLOQUEO)
  // ----------------------------------
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Correo y contraseña son obligatorios" });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      // Verificar bloqueo
      if (user.is_blocked) {
        const diffMin =
          (Date.now() - new Date(user.last_failed_at)) / 1000 / 60;

        if (diffMin < BLOCK_MINUTES) {
          return res.status(403).json({
            message: `Cuenta bloqueada. Intenta en ${Math.ceil(
              BLOCK_MINUTES - diffMin
            )} minutos.`,
          });
        } else {
          await UserModel.resetLoginFail(user.id);
        }
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        const attempts = (user.failed_attempts || 0) + 1;
        const isBlocked = attempts >= 3;

        await UserModel.updateLoginFail(
          user.id,
          attempts,
          isBlocked ? 1 : 0,
          new Date()
        );

        if (isBlocked) {
          return res.status(403).json({
            message: `Cuenta bloqueada por ${BLOCK_MINUTES} minutos.`,
          });
        }

        return res.status(401).json({
          message: `Credenciales incorrectas. Intentos fallidos: ${attempts}/3`,
        });
      }

      await UserModel.resetLoginFail(user.id);

      const token = generateToken(user);

      res.json({
        message: "Login exitoso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (err) {
      console.error("Error en login:", err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  // ----------------------------------
  // PERFIL
  // ----------------------------------
  async profile(req, res) {
    try {
      res.json({
        message: "Perfil del usuario autenticado",
        user: req.user,
      });
    } catch (err) {
      console.error("Error en profile:", err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },

  // ----------------------------------
  // RECUPERAR CONTRASEÑA
  // ----------------------------------
  async recover(req, res) {
    try {
      const { email } = req.body;

      const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No existe una cuenta con ese correo" });
      }

      const user = rows[0];

      const realPassword = user.password_plain;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "coinmaster150704@gmail.com",
          pass: "otygsninezcbelku",
        },
      });

      await transporter.sendMail({
        from: "UrbanFit Store",
        to: email,
        subject: "Recuperación de contraseña",
        html: `
      <h2>Recuperación de Contraseña</h2>
      <p>Hola ${user.name},</p>
      <p>Tu contraseña es:</p>
      <h3>${realPassword}</h3>
      <p>Por favor inicia sesión cuando gustes.</p>
    `,
      });


      res.json({ message: "Contraseña temporal enviada al correo" });
    } catch (err) {
      console.error("Error recover:", err);
      res.status(500).json({ message: "Error enviando correo" });
    }
  },
};

module.exports = AuthController;
