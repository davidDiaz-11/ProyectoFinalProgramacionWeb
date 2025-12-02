// src/routes/authRoutes.js
const express = require("express");
const AuthController = require("../controllers/authController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/auth/register
router.post("/register", AuthController.register);

// POST /api/auth/login
router.post("/login", AuthController.login);

// GET /api/auth/me (requiere token)
router.get("/me", authRequired, AuthController.profile);

module.exports = router;
