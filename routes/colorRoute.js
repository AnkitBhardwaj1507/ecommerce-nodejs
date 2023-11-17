const express = require('express');
const { authMiddleware } = require('../midlewares/authmiddleware');
const { createColor, getColor, updateColor, deleteColor, getAllColor } = require('../controllers/colorController');
const router = express.Router();

router.post('/', authMiddleware, createColor);
router.get("/:id", authMiddleware,  getColor);
router.put("/:id", authMiddleware, updateColor);
router.delete('/:id', authMiddleware, deleteColor);
router.get("/", authMiddleware, getAllColor);

module.exports = router;