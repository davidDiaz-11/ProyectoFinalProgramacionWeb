const express = require("express");
const AdminController = require("../controllers/adminController");
const ProductController = require("../controllers/productController"); // 👈 AGREGAR
const { authRequired, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// 📦 RUTAS DE PRODUCTOS PARA ADMIN
router.get("/products", authRequired, adminOnly, ProductController.getAllAdmin);

router.get("/products/:id", authRequired, adminOnly, ProductController.getById);

router.patch(
  "/products/:id/visibility",
  authRequired,
  adminOnly,
  ProductController.toggleVisibility
);

router.patch(
  "/products/:id/stock",
  authRequired,
  adminOnly,
  ProductController.updateStock
);

router.get("/total-sales", authRequired, adminOnly, AdminController.totalSales);

router.get(
  "/sales-by-category",
  authRequired,
  adminOnly,
  AdminController.salesByCategory
);

router.get("/inventory", authRequired, adminOnly, AdminController.inventory);
router.get(
  "/sales-chart",
  authRequired,
  adminOnly,
  AdminController.salesChart
);

router.get(
  "/stock-by-category",
  authRequired,
  adminOnly,
  AdminController.stockByCategory
);


module.exports = router;
