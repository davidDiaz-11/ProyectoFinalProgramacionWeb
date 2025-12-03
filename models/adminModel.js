const pool = require("../config/db");

const AdminModel = {
  async getTotalSales() {
    const [rows] = await pool.query(`
      SELECT SUM(total) AS total_sales
      FROM orders
    `);
    return rows[0];
  },

  async getSalesByCategory() {
    const [rows] = await pool.query(`
      SELECT c.name AS category_name, SUM(oi.quantity * oi.unit_price) AS total_sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.id, c.name
    `);
    return rows;
  },

  async getInventoryReport() {
    const [rows] = await pool.query(`
      SELECT 
        c.name AS category_name,
        SUM(p.inventory) AS total_stock
      FROM products p
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.id, c.name
    `);

    return rows;
  },
};

module.exports = AdminModel;
