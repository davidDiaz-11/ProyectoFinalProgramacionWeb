const express = require("express");
const ProductController = require("../controllers/productController");
const { adminOnly, authRequired } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// ============================
// RUTAS ADMIN (primero)
// ============================
router.get("/all-admin", authRequired, isAdmin, ProductController.getAllAdmin);
router.put(
  "/toggle/:id",
  authRequired,
  isAdmin,
  ProductController.toggleVisibility
);
router.put("/stock/:id", authRequired, isAdmin, ProductController.updateStock);

// ============================
// RUTAS PÚBLICAS
// ============================
router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);

// ============================
// CRUD ADMIN (crear, actualizar, borrar)
// ============================
router.post("/", authRequired, adminOnly, ProductController.create);
router.put("/:id", authRequired, adminOnly, ProductController.update);
router.delete("/:id", authRequired, adminOnly, ProductController.delete);

module.exports = router;
