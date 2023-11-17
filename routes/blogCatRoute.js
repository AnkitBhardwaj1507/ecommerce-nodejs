const express = require('express');
const { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory } = require('../controllers/blogCatController');
const { authMiddleware, isAdmin } = require('../midlewares/authmiddleware');
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCategory);
router.put('/:id', authMiddleware, isAdmin, updateCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteCategory);
router.get('/:id', getCategory);
router.get('/', getAllCategory);

module.exports = router;