const express = require("express");
const CartController = require("../controllers/cartController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

// Carrito del usuario autenticado
router.get("/", authRequired, CartController.getCart);

// Agregar al carrito
router.post("/add", authRequired, CartController.addToCart);

// Actualizar cantidad
router.put("/update/:item_id", authRequired, CartController.updateItem);

// Eliminar item
router.delete("/delete/:item_id", authRequired, CartController.deleteItem);

module.exports = router;
