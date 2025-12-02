// src/controllers/cartController.js
const CartModel = require("../models/cartModel");
const pool = require("../config/db");

const CartController = {
  async getCart(req, res) {
    try {
      const userId = req.user.id;

      const cart = await CartModel.getOrCreateCart(userId);
      const items = await CartModel.getItems(cart.id);

      // Calcular subtotal
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      res.json({
        cart_id: cart.id,
        items,
        subtotal,
      });
    } catch (err) {
      console.error("Error getCart:", err);
      res.status(500).json({ message: "Error al obtener carrito" });
    }
  },

  async addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    // Validaciones básicas
    if (!product_id) {
      return res.status(400).json({ message: "Falta product_id" });
    }

    // 1. Revisar inventario
    const [productRows] = await pool.query(
      "SELECT inventory FROM products WHERE id = ?",
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    if (productRows[0].inventory <= 0) {
      return res.status(400).json({
        message: "Este producto está agotado y no se puede agregar al carrito.",
      });
    }

    // 2. Obtener o crear carrito del usuario
    const cart = await CartModel.getOrCreateCart(userId);

    // 3. Agregar producto al carrito
    await CartModel.addItem(cart.id, product_id, quantity || 1);

    res.json({ message: "Producto agregado al carrito correctamente." });
  } catch (err) {
    console.error("Error addToCart:", err);
    res.status(500).json({ message: "Error al agregar al carrito" });
  }
},


  async updateItem(req, res) {
    try {
      const { item_id } = req.params;
      const { quantity } = req.body;

      await CartModel.updateQuantity(item_id, quantity);

      res.json({ message: "Cantidad actualizada" });
    } catch (err) {
      console.error("Error updateItem:", err);
      res.status(500).json({ message: "Error al actualizar cantidad" });
    }
  },

  async deleteItem(req, res) {
    try {
      const { item_id } = req.params;

      await CartModel.deleteItem(item_id);
      res.json({ message: "Producto eliminado del carrito" });
    } catch (err) {
      console.error("Error deleteItem:", err);
      res.status(500).json({ message: "Error al eliminar producto" });
    }
  },
};

module.exports = CartController;
