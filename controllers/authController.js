// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const BLOCK_MINUTES = parseInt(process.env.BLOCK_MINUTES || "5", 10);

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

const AuthController = {
  // Registro
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
      const user = await UserModel.createUser({ name, email, passwordHash });

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

  // Login con bloqueo
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

      // Checar bloqueo
      if (user.is_blocked) {
        const lastFailed = user.last_failed_at;
        const now = new Date();

        if (lastFailed) {
          const diffMs = now - lastFailed;
          const diffMin = diffMs / 1000 / 60;

          if (diffMin < BLOCK_MINUTES) {
            const remaining = Math.ceil(BLOCK_MINUTES - diffMin);
            return res.status(403).json({
              message: `Cuenta bloqueada. Intenta de nuevo en ${remaining} minuto(s).`,
            });
          } else {
            // tiempo cumplido, desbloqueamos
            await UserModel.resetLoginFail(user.id);
            user.failed_attempts = 0;
            user.is_blocked = 0;
          }
        }
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        const attempts = (user.failed_attempts || 0) + 1;
        const isBlocked = attempts >= 3 ? 1 : 0;
        await UserModel.updateLoginFail(
          user.id,
          attempts,
          isBlocked,
          new Date()
        );

        if (isBlocked) {
          return res.status(403).json({
            message: `Cuenta bloqueada por ${BLOCK_MINUTES} minutos por múltiples intentos fallidos.`,
          });
        } else {
          return res.status(401).json({
            message: `Credenciales incorrectas. Intentos fallidos: ${attempts}/3`,
          });
        }
      }

      // Si la contraseña es correcta, reseteamos intentos
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

  // Ruta para obtener perfil
  async profile(req, res) {
    try {
      const user = req.user; // viene de middleware
      res.json({
        message: "Perfil del usuario autenticado",
        user,
      });
    } catch (err) {
      console.error("Error en profile:", err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  },
};

module.exports = AuthController;
