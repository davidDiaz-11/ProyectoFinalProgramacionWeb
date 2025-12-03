// src/server.js
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query("SELECT 1"); // probar conexión
    console.log("✅ Conexión a la base de datos exitosa");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
    process.exit(1);
  }
}

start();
