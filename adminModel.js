// src/controllers/productController.js
const ProductModel = require("../models/productModel");
const pool = require("../config/db"); // ← ESTA ES LA LÍNEA QUE FALTABA

const ProductController = {
  async getAll(req, res) {
    try {
      const products = await ProductModel.getAll();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener productos" });
    }
  },

  async getAllAdmin(req, res) {
    try {
      const [rows] = await pool.query("SELECT * FROM products");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener productos (admin)" });
    }
  },

  async toggleVisibility(req, res) {
    try {
      const { id } = req.params;
      await pool.query(
        "UPDATE products SET is_visible = NOT is_visible WHERE id = ?",
        [id]
      );
      res.json({ message: "Visibilidad cambiada" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al cambiar visibilidad" });
    }
  },

  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { inventory } = req.body;

      await pool.query("UPDATE products SET inventory = ? WHERE id = ?", [
        inventory,
        id,
      ]);

      res.json({ message: "Inventario actualizado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al actualizar inventario" });
    }
  },

  async getById(req, res) {
    try {
      const id = req.params.id;
      const product = await ProductModel.getById(id);
      if (!product)
        return res.status(404).json({ message: "Producto no encontrado" });
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener producto" });
    }
  },

  async create(req, res) {
    try {
      const product = req.body;
      const created = await ProductModel.create(product);
      res.status(201).json(created);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al crear producto" });
    }
  },

  async update(req, res) {
    try {
      const id = req.params.id;
      const product = req.body;
      const updated = await ProductModel.update(id, product);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al actualizar producto" });
    }
  },

  async delete(req, res) {
    try {
      const id = req.params.id;
      await ProductModel.delete(id);
      res.json({ message: "Producto eliminado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al eliminar producto" });
    }
  },
};
