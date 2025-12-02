const express = require("express");
const ProductController = require("../controllers/productController");
const { adminOnly, authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);
router.post("/", authRequired, adminOnly, ProductController.create);
router.put("/:id", authRequired, adminOnly, ProductController.update);
router.delete("/:id", authRequired, adminOnly, ProductController.delete);

module.exports = router;
