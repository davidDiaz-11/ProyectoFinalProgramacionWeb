// src/controllers/orderController.js
const pool = require("../config/db");
const OrderModel = require("../models/orderModel");
const { generateOrderPDF } = require("../utils/pdfGenerator");
const { sendEmail } = require("../utils/mailer");

const OrderController = {
  // ============================================
  // CHECKOUT
  // ============================================
  async checkout(req, res) {
    try {
      const userId = req.user.id;

      // 1. Obtener datos del body
      const {
        shipping_name,
        shipping_address,
        shipping_city,
        shipping_postal,
        shipping_country,
        payment_method,
        coupon_code,
      } = req.body;

      if (
        !shipping_name ||
        !shipping_address ||
        !shipping_city ||
        !shipping_postal ||
        !shipping_country ||
        !payment_method
      ) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios." });
      }

      // 2. Obtener carrito
      const [cartRows] = await pool.query(
        "SELECT * FROM carts WHERE user_id = ? LIMIT 1",
        [userId]
      );

      if (cartRows.length === 0) {
        return res.status(400).json({ message: "El carrito está vacío." });
      }

      const cartId = cartRows[0].id;

      const [items] = await pool.query(
        `SELECT 
            ci.id AS cart_item_id,
            ci.product_id,
            ci.quantity,
            p.name,
            p.price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = ?`,
        [cartId]
      );

      if (items.length === 0) {
        return res.status(400).json({ message: "El carrito está vacío." });
      }

      // =============================
      // VALIDAR INVENTARIO ANTES DEL CHECKOUT
      // =============================
      for (const item of items) {
        const [stockRows] = await pool.query(
          "SELECT inventory FROM products WHERE id = ?",
          [item.product_id]
        );

        const stock = stockRows[0].inventory;

        if (stock < item.quantity) {
          return res.status(400).json({
            message: `Stock insuficiente para '${item.name}'. Solo hay ${stock} disponibles.`,
          });
        }
      }

      // =============================
      // CALCULAR TOTALES
      // =============================

      const subtotal = items.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity),
        0
      );

      let taxRate = 0.16; // México por defecto
      let shippingCost = 150;

      switch (shipping_country) {
        case "Estados Unidos":
          taxRate = 0.1;
          shippingCost = 15;
          break;

        case "España":
          taxRate = 0.21;
          shippingCost = 10;
          break;
      }

      const tax = subtotal * taxRate;
      const discountAmount =
        coupon_code === "DESCUENTO10" || coupon_code === "URBANFIT10"
          ? subtotal * 0.1
          : 0;
      const total = subtotal + tax + shippingCost - discountAmount;

      // =============================
      // CREAR ORDEN EN BD
      // =============================
      const orderId = await OrderModel.createOrder(
        {
          user_id: userId,
          shipping_name,
          shipping_address,
          shipping_city,
          shipping_postal,
          shipping_country,
          payment_method,
          subtotal,
          tax,
          shipping_cost: shippingCost,
          coupon_code,
          discount_amount: discountAmount,
          total,
        },
        items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: Number(item.price),
          name: item.name,
        }))
      );

      // =============================
      // LIMPIAR CARRITO
      // =============================
      await pool.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

      // =============================
      // GENERAR PDF
      // =============================
      const pdfItems = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: Number(item.price),
      }));

      const pdfPath = await generateOrderPDF({
        company: {
          name: "UrbanFit Store",
          slogan: "Estilo que te mueve.",
        },
        user: {
          email: req.user.email,
        },
        order: {
          shipping_name,
          shipping_address,
          shipping_city,
          shipping_postal,
          shipping_country,
          subtotal,
          tax,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          coupon_code,
          total,
        },
        items: pdfItems,
      });

      // =============================
      // ENVIAR EMAIL
      // =============================
      await sendEmail({
        to: req.user.email,
        subject: "Tu compra en UrbanFit Store",
        html: `
    <h2>Gracias por tu compra en UrbanFit Store</h2>
    <p>Adjuntamos tu nota de compra en formato PDF.</p>
    <p>Total: <strong>$${total.toFixed(2)}</strong></p>
  `,
        attachments: [
          {
            filename: `orden-${orderId}.pdf`,
            content: pdfPath, // buffer -> lo convertimos en mailer.js
          },
        ],
      });

      return res.json({
        message: "Compra completada. Nota enviada a tu correo.",
        order_id: orderId,
        subtotal,
        tax,
        shippingCost,
        discountAmount,
        total,
      });
    } catch (err) {
      console.error("Error en checkout:", err);
      res.status(500).json({
        message: "Error en el proceso de compra.",
        error: err.message,
      });
    }
  },
};

module.exports = OrderController;
