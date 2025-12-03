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
  async salesChart(req, res) {
    try {
      const data = await AdminModel.getSalesChart();
      res.json(data);
    } catch (err) {
      console.error("Error salesChart:", err);
      res.status(500).json({ message: "Error obteniendo gráfico de ventas" });
    }
  },

  async stockByCategory(req, res) {
    try {
      const data = await AdminModel.getStockByCategory();
      res.json(data);
    } catch (err) {
      console.error("Error stockByCategory:", err);
      res.status(500).json({ message: "Error obteniendo stock por categoría" });
    }
  }
};



module.exports = AdminController;
