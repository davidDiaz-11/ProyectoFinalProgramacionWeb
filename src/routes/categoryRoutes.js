const express = require("express");
const CategoryController = require("../controllers/categoryController");
const { adminOnly, authRequired } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", CategoryController.getAll);
router.post("/", authRequired, adminOnly, CategoryController.create);

module.exports = router;
