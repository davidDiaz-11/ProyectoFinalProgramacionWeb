// src/models/productModel.js
const pool = require("../config/db");

const ProductModel = {
  // ---------------------------------------------------------
  // Cambiar visibilidad
  // ---------------------------------------------------------
  async toggleVisibility(id) {
    await pool.query(
      "UPDATE products SET is_visible = NOT is_visible WHERE id = ?",
      [id]
    );
  },

  // ---------------------------------------------------------
  // Actualizar inventario
  // ---------------------------------------------------------
  async updateStock(id, inventory) {
    await pool.query("UPDATE products SET inventory = ? WHERE id = ?", [
      inventory,
      id,
    ]);
  },

  // ---------------------------------------------------------
  // OBTENER PRODUCTOS (con filtros)
  // ---------------------------------------------------------
  async getAll(filters = {}) {
    let sql = `
    SELECT 
      p.*, 
      c.name AS category,
      CASE 
        WHEN p.is_on_sale = 1 THEN ROUND(p.price * 0.80, 2)
        ELSE p.price
      END AS final_price
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_visible = 1
  `;

    const params = [];

    // 📌 FILTRO CATEGORÍAS — permite una o múltiples
    if (filters.category_id) {
      let categories = filters.category_id;

      // Convertir array en string "3,5,8"
      if (Array.isArray(categories)) {
        categories = categories.join(",");
      }

      // Convertir número a string
      if (typeof categories === "number") {
        categories = categories.toString();
      }

      // Convertir string tipo "3,5" a array
      categories = categories.toString().split(",");

      sql += ` AND p.category_id IN (${categories.map(() => "?").join(",")})`;
      params.push(...categories);
    }

    // 📌 FILTRO PRECIO MÍNIMO
    if (filters.min_price) {
      sql += " AND p.price >= ?";
      params.push(filters.min_price);
    }

    // 📌 FILTRO PRECIO MÁXIMO
    if (filters.max_price) {
      sql += " AND p.price <= ?";
      params.push(filters.max_price);
    }

    // 📌 FILTRO "solo productos con descuento"
    if (filters.on_sale === "1") {
      sql += " AND p.is_on_sale = 1";
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  },
  // ---------------------------------------------------------
  // ADMIN: obtener todos los productos
  // ---------------------------------------------------------
  async getAllAdmin() {
    const [rows] = await pool.query("SELECT * FROM products");
    return rows;
  },

  // ---------------------------------------------------------
  // Obtener producto por ID
  // ---------------------------------------------------------
  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

  // ---------------------------------------------------------
  // Crear producto
  // ---------------------------------------------------------
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
      `INSERT INTO products 
      (name, description, price, inventory, image_url, category_id, is_on_sale)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, inventory, image_url, category_id, is_on_sale]
    );

    return { id: result.insertId, ...product };
  },

  // ---------------------------------------------------------
  // Actualizar producto completo
  // ---------------------------------------------------------
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
       SET name=?, description=?, price=?, inventory=?, image_url=?,
           category_id=?, is_on_sale=?
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

  // ---------------------------------------------------------
  // Eliminar producto
  // ---------------------------------------------------------
  async delete(id) {
    await pool.query("DELETE FROM products WHERE id=?", [id]);
  },
};

module.exports = ProductModel;
