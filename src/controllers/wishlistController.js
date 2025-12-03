// src/controllers/wishlistController.js
const pool = require("../config/db");

module.exports = {
  // =============================
  // OBTENER LISTA DE DESEOS
  // =============================
  async getWishlist(req, res) {
    try {
      const userId = req.user.id;

      const [rows] = await pool.query(
        `SELECT 
            w.product_id,
            p.name,
            p.price,
            p.image_url,
            p.is_on_sale,
            p.description,
            CASE 
              WHEN p.is_on_sale = 1 THEN ROUND(p.price * 0.80, 2)
              ELSE p.price
            END AS final_price
         FROM wishlist w
         JOIN products p ON w.product_id = p.id
         WHERE w.user_id = ?`,
        [userId]
      );

      res.json(rows);
    } catch (err) {
      console.error("Wishlist error:", err);
      res.status(500).json({ message: "Error obteniendo wishlist" });
    }
  },

  // =============================
  // AGREGAR A LISTA DE DESEOS
  // =============================
  async addToWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;

      await pool.query(
        "INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)",
        [userId, product_id]
      );

      res.json({ message: "Producto agregado a la lista de deseos" });
    } catch (err) {
      console.error("Wishlist add error:", err);
      res.status(500).json({ message: "Error al agregar a wishlist" });
    }
  },

  // =============================
  // ELIMINAR DE LISTA DE DESEOS
  // =============================
  async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params; // 👈 VIENE DE LA URL /remove/:productId

      await pool.query(
        "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
        [userId, productId]
      );

      res.json({ message: "Producto eliminado de la lista de deseos" });
    } catch (err) {
      console.error("Wishlist remove error:", err);
      res.status(500).json({ message: "Error eliminando de wishlist" });
    }
  },
};
