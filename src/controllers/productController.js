// src/controllers/productController.js
const ProductModel = require("../models/productModel");

const ProductController = {
  async getAll(req, res) {
    try {
      const filters = {
        category_id: req.query.category_id || null,
        min_price: req.query.min_price || null,
        max_price: req.query.max_price || null,
        on_sale: req.query.on_sale || null,
      };

      const products = await ProductModel.getAll(filters);
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener productos" });
    }
  },
  async getAllAdmin(req, res) {
    try {
      const products = await ProductModel.getAllAdmin();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener productos (admin)" });
    }
  },

  async toggleVisibility(req, res) {
    try {
      const { id } = req.params;
      await ProductModel.toggleVisibility(id);
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

      await ProductModel.updateStock(id, inventory);

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

module.exports = ProductController;
