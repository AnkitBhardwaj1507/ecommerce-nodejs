const express = require('express');
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishlist, rating, uploadImages } = require('../controllers/productController');
const { authMiddleware, isAdmin } = require('../midlewares/authmiddleware');
const { uploadPhotos, productImageResize } = require('../midlewares/uploadImages');
const router = express.Router();


router.post('/', authMiddleware, isAdmin, createProduct);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhotos.array("images", 10), productImageResize, uploadImages);
router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.put('/:id',authMiddleware, isAdmin, updateProduct);
router.delete('/:id',authMiddleware, isAdmin, deleteProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);

module.exports = router;