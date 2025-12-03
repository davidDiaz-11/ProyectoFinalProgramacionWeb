// src/controllers/categoryController.js
const CategoryModel = require("../models/categoryModel");

const CategoryController = {
  async getAll(req, res) {
    try {
      const categories = await CategoryModel.getAll();
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener categorías" });
    }
  },

  async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Nombre requerido" });

      const category = await CategoryModel.create(name);
      res.status(201).json(category);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al crear categoría" });
    }
  },
};

module.exports = CategoryController;
