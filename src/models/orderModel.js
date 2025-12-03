// src/models/orderModel.js
const pool = require("../config/db");

const OrderModel = {
  async createOrder(orderData, items) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders
          (user_id, shipping_name, shipping_address, shipping_city, shipping_postal,
           shipping_country, payment_method, subtotal, tax, shipping_cost, coupon_code,
           discount_amount, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.user_id,
          orderData.shipping_name,
          orderData.shipping_address,
          orderData.shipping_city,
          orderData.shipping_postal,
          orderData.shipping_country,
          orderData.payment_method,
          orderData.subtotal,
          orderData.tax,
          orderData.shipping_cost,
          orderData.coupon_code || null,
          orderData.discount_amount || 0,
          orderData.total,
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of items) {
        const [productRows] = await conn.query(
          "SELECT inventory, price FROM products WHERE id = ? FOR UPDATE",
          [item.product_id]
        );

        if (productRows.length === 0) {
          throw new Error(`Producto con ID ${item.product_id} no existe.`);
        }

        const stock = productRows[0].inventory;
        const priceFromDB = Number(productRows[0].price);
        const unitPrice = Number(item.unit_price || item.price || priceFromDB);

        if (stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para el producto '${item.name}'. Solo quedan ${stock} en inventario.`
          );
        }

        await conn.query(
          "UPDATE products SET inventory = inventory - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );

        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, unitPrice]
        );
      }

      await conn.commit();
      conn.release();
      return orderId;
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  },
};

module.exports = OrderModel;
