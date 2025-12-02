// src/controllers/adminController.js
const AdminModel = require("../models/adminModel");

const AdminController = {
  async totalSales(req, res) {
    try {
      const data = await AdminModel.getTotalSales();
      res.json(data);
    } catch (err) {
      console.error("Error totalSales:", err);
      res.status(500).json({ message: "Error obteniendo ventas totales" });
    }
  },

  async salesByCategory(req, res) {
    try {
      const data = await AdminModel.getSalesByCategory();
      res.json(data);
    } catch (err) {
      console.error("Error salesByCategory:", err);
      res
        .status(500)
        .json({ message: "Error obteniendo ventas por categoría" });
    }
  },

  async inventory(req, res) {
    try {
      const data = await AdminModel.getInventoryReport();
      res.json(data);
    } catch (err) {
      console.error("Error inventory:", err);
      res.status(500).json({ message: "Error obteniendo inventario" });
    }
  },
};

module.exports = AdminController;
