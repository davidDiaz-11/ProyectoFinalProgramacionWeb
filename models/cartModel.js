// src/models/cartModel.js
const pool = require("../config/db");

const CartModel = {
  async getOrCreateCart(userId) {
    const [rows] = await pool.query("SELECT * FROM carts WHERE user_id=?", [
      userId,
    ]);

    if (rows.length > 0) return rows[0];

    const [result] = await pool.query(
      "INSERT INTO carts (user_id) VALUES (?)",
      [userId]
    );

    return { id: result.insertId, user_id: userId };
  },

  async getItems(cartId) {
    const [rows] = await pool.query(
      `SELECT
        ci.id AS cart_item_id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.image_url,
        p.is_on_sale,
        CASE
          WHEN p.is_on_sale = 1 THEN ROUND(p.price * 0.80, 2)
          ELSE p.price
        END AS final_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?`,
      [cartId]
    );

    return rows;
  },
  async addItem(cartId, productId, qty = 1) {
    // ¿Ya existe el producto en el carrito?
    const [rows] = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id=? AND product_id=?",
      [cartId, productId]
    );

    if (rows.length > 0) {
      // Incrementar cantidad
      const newQty = rows[0].quantity + qty;
      await pool.query("UPDATE cart_items SET quantity=? WHERE id=?", [
        newQty,
        rows[0].id,
      ]);
      return;
    }

    // Crear nuevo item
    await pool.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cartId, productId, qty]
    );
  },

  async updateQuantity(itemId, newQty) {
    await pool.query("UPDATE cart_items SET quantity=? WHERE id=?", [
      newQty,
      itemId,
    ]);
  },

  async deleteItem(itemId) {
    await pool.query("DELETE FROM cart_items WHERE id=?", [itemId]);
  },
};

module.exports = CartModel;
