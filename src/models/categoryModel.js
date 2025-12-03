// src/models/categoryModel.js
const pool = require("../config/db");

const CategoryModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM categories");
    return rows;
  },

  async create(name) {
    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    return { id: result.insertId, name };
  },
};

module.exports = CategoryModel;
