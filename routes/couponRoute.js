const express = require('express');
const router = express.Router();
const {authMiddleware, isAdmin} = require('../midlewares/authmiddleware');
const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon } = require('../controllers/couponController');

router.post('/', authMiddleware, isAdmin, createCoupon);
router.get('/', authMiddleware, isAdmin, getAllCoupons);
router.put(':id', authMiddleware, isAdmin, updateCoupon);
router.delete('/:id', authMiddleware, isAdmin, deleteCoupon);

module.exports = router;