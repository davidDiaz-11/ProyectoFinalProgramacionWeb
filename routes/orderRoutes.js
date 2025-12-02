// src/routes/orderRoutes.js
const express = require("express");
const OrderController = require("../controllers/orderController");
const { authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/checkout", authRequired, OrderController.checkout);

module.exports = router;
