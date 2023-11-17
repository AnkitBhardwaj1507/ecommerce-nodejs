const express = require('express');
const router = express.Router();

const {
    loginController,
    getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    signoutController,
    updatePassword,
    forgetPasswordToken,
    resetPassword,
    adminLoginController,
    createUser,
    getUserWishlist,
    saveUserAddress,
    userCart,
    getUserCart,
    removeCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../midlewares/authmiddleware');

router.post('/register', createUser);
router.post('/signin', loginController);
router.post('/admin-login', adminLoginController);
router.post('/forget-password-token', forgetPasswordToken);
router.post('/cart', userCart);
router.post('/cart/apply-coupon', authMiddleware, applyCoupon);
router.post('/cart/cash-order', authMiddleware, createOrder);

router.put('/reset-password/:token', resetPassword);
router.put('/password', updatePassword);


router.get('/all-users', getAllUsers);
router.get('/refresh', handleRefreshToken);
router.get('/signout', signoutController);
router.get('/:id', authMiddleware, getUser);
router.get('/wishlist', authMiddleware, getUserWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/get-orders', authMiddleware, getOrders);

router.delete('/remove-cart', authMiddleware, removeCart);
router.delete('/:id', deleteUser);

router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.put('/:id',authMiddleware, updateUser);
router.put("/save-address", authMiddleware, saveUserAddress)
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);


module.exports = router;