const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authRequired } = require("../middleware/authMiddleware");

// Obtener wishlist del usuario
router.get("/", authRequired, wishlistController.getWishlist);

// Agregar producto
router.post("/add", authRequired, wishlistController.addToWishlist);

// Eliminar producto
router.delete(
  "/remove/:productId",
  authRequired,
  wishlistController.removeFromWishlist
);

module.exports = router;
