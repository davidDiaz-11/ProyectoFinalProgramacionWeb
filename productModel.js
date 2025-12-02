// src/models/productModel.js
const pool = require("../config/db");

const ProductModel = {
  async toggleVisibility(id) {
    await pool.query(
      "UPDATE products SET is_visible = NOT is_visible WHERE id = ?",
      [id]
    );
  },

  async updateStock(id, inventory) {
    await pool.query("UPDATE products SET inventory = ? WHERE id = ?", [
      inventory,
      id,
    ]);
  },

  async getAllAdmin() {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
  },

  async getAll(categoryId) {

  let query = `
    SELECT p.*, c.name AS category
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_visible = 1
  `;

  const params = [];

  if (categoryId) {
    query += " AND p.category_id = ?";
    params.push(categoryId);
  }

  const [rows] = await pool.query(query, params);
  return rows;
},

  async getById(id) {
    const [rows] = await pool.query(
      `
    SELECT * FROM products WHERE id = ?
  `,
      [id]
    );
    return rows[0];
  },

  async create(product) {
    const {
      name,
      description,
      price,
      inventory,
      image_url,
      category_id,
      is_on_sale,
    } = product;

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, inventory, image_url, category_id, is_on_sale)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, inventory, image_url, category_id, is_on_sale]
    );

    return { id: result.insertId, ...product };
  },

  async update(id, product) {
    const {
      name,
      description,
      price,
      inventory,
      image_url,
      category_id,
      is_on_sale,
    } = product;

    await pool.query(
      `UPDATE products
       SET name=?, description=?, price=?, inventory=?, image_url=?, category_id=?, is_on_sale=?
       WHERE id=?`,
      [
        name,
        description,
        price,
        inventory,
        image_url,
        category_id,
        is_on_sale,
        id,
      ]
    );

    return { id, ...product };
  },

  async delete(id) {
    await pool.query("DELETE FROM products WHERE id=?", [id]);
  },
};

module.exports = ProductModel;
