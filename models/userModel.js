// src/models/userModel.js
const pool = require("../config/db");

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  async createUser({ name, email, passwordHash, passwordPlain }) {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, password_plain) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, passwordPlain]
    );

    return {
      id: result.insertId,
      name,
      email,
      role: "user",
    };
  },
  async updateLoginFail(userId, failedAttempts, isBlocked, date) {
    await pool.query(
      "UPDATE users SET failed_attempts = ?, is_blocked = ?, last_failed_at = ? WHERE id = ?",
      [failedAttempts, isBlocked, date, userId]
    );
  },

  async resetLoginFail(userId) {
    await pool.query(
      "UPDATE users SET failed_attempts = 0, is_blocked = 0, last_failed_at = NULL WHERE id = ?",
      [userId]
    );
  },
};

module.exports = UserModel;
