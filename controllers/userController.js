const { generateToken } = require('../config/jwt');
const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const uniqid = require('uniqid');

const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');
const generateRefreshToken = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./mailController');
const crypto = require(crypto);

const createUser = asyncHandler(async (req, res) =>  {
    const email = req.body.email;
    const findUser = await User.findOne({email});

    if(!findUser) {
        const user = await User.create(req.body);
        res.json({
            message: 'New User Created Succesfully',
            success: true
        })
    }else {
        throw new Error('User Already Exists');
    }
});

const loginController = asyncHandler ( async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({email});

    if(findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true
            }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72*60*60*1000,
        });
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    }else {
        throw new Error("Invalid Email or Password");
    }
});

//Admin login controller
const adminLoginController = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    const findAdmin = await User.findOne({ email });
    if(findAdmin.role !== 'admin') throw new Error('Not Authorized');

    if(findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin.id,
            
            {
                refreshToken: refreshToken
            },
            {
                new: true
            }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000
        });

        res.json({
            _id: findAdmin?._id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastName,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id)
        });
    }else {
        throw new Error("Invalid Email or Password");
    }
});

//Save user address
const saveUserAddress = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);

    try {   
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req.body?.address,
            },
            {
                new: true
            }
        );
        res.json(updatedUser);

    }catch(err) {
        throw new Error(err);
    }
})

// get All users
const getAllUsers = asyncHandler(async(req, res) => {
    try {
        const getUsers = await User.find({});
        res.json(getUsers);
    }catch(err) {
        throw new Error(err);
    }
});

//handle Refresh Token 
const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No Refresh token found");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne(refreshToken);
    if(!user) throw new Error("No Refresh token found or not Matched");

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
        if(err || user.id !== decode.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user?._id);
        res.json({
            accessToken
        })
    });
});

//logout a user
const signoutController = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No Refresh token found");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if(!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });
        return res.sendStatus(204); //forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    });
    res.sendStatus(204);
})

//Update a user
const updateUser = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updatedUser = User.findByIdAndUpdate(_id, {
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        }, {
            new: true
        }
        );
        res.json({
            updatedUser
        })
    }catch(error) {
        throw new Error(error);
    }
})

//get a single user 

const getUser = asyncHandler (async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findById(id);
        res.json ({
            user
        })
    }catch(err) {
        throw new Error(err);
    }
    
})

//Delete a user

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        res.json({
            deleteUser
        })
    }catch(error) {
        throw new Error(error);
    }
})

const blockUser = asyncHandler(async(req, res) =>  {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const user = await User.findById(id, {
            isBlocked: true
        }, {
            new: true
        });
        
    }catch(error) {
        throw new Error(error);
    }
    res.json({
        message: "User Blocked",
    })
})

const unblockUser = asyncHandler(async(req, res) =>  {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const blockedUser = await User.findById(id,
            {
                isBlocked: false,
            }, 
            {
                new: true
            }  
        );

        res.json({
            message: "User unBlocked Successfully",
        });

    }catch(error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async( req, res ) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if(password) {
        user.password = password;
        const updatedPassword = await User.save();
        res.json({
            message: 'Password Updated Successfully'
        })
    }else {
        res.json(user);
    }
});

//Generate reset password Token
const forgetPasswordToken = asyncHandler(async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne({ email });
    if(!user) throw new Error("User not Found");
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, please follow this link to reset your password. This link expires in 10 minutes <a href="http://localhost:5000">click here</a>`;
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forget Password Link",
            htm: resetURL
        };
        sendEmail(data);
        res.json(token);
    }catch(err) {
        throw new Error(err);
    }

});

const resetPassword = asyncHandler(async(req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256")
    .update(token)
    .digest("hex");
    const user = User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: Date.now() }
    });
    if(!user) throw new Error("Token Expired, Please Try Again Later");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});


//get user product wishlist
const getUserWishlist = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    
    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    }catch(err) {
        throw new Error(err);
    }
});

const userCart = asyncHandler(async(req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);

    try{
        let products = [];
        const user = await User.findById(_id);
        //check if user already have product in cart
        const alreadyExistCart = await Cart.findOne({ orderby: user._id});
        if(alreadyExistCart) {
            alreadyExistCart.remove();
        } 

        for(let i=0; i<cart.length; i++) {
            let obj = {};
            obj.product = cart[i]._id;
            obj.count = cart[i].count;
            obj.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            obj.price = getPrice.price
            products.push(obj);
        }

        let cartTotal = 0;
        for(let i=0; i<products.length; i++) {
            cartTotal += products[i].price * products[i].count;
        }

        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id
        });
        res.json(newCart);
    }catch(err) {
        throw new Error(err);
    }

});

const getUserCart = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);

    try{
        const cart = await Cart.findOne({ orderby: _id }).populate("products.product");
        res.json(cart);
    }catch(err) {
        throw new Error(err);
    }
});

const removeCart = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);

    try{
        const user = await User.findOne({_id});
        const cart = await Cart.findOneAndRemove({ orderby: user._id });
        res.json(cart);
    }catch(err) {
        throw new Error(err);
    }
});

const applyCoupon = asyncHandler(async(req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);

    try {
        const validCoupon = await Coupon.findOne({ name: coupon});
        if(validCoupon === null) {
            throw new Error("Invalid Coupon");

        }
        const user = await User.findOne({_id});
        let { products, cartTotal } = await Cart.findOne({ orderby: user._id }).populate(products.product);

        let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount)/100).toFixed(2);
        await Cart.findByIdAndUpdate(
            {orderby: user._id},
            {totalAfterDiscount},
            {new: true}
        );
        res.json(totalAfterDiscount);
    }catch(err) {
        throw new Error(err);
    }
});

const createOrder = asyncHandler(async(req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);

    try{
        if(!COD) throw new Error("Create cash order failed");
        const user = await User.findById(_id);
        const userCart = await Cart.findOne({ orderby: user._id });
        let finalAmount = 0;
        if(couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        }else {
            finalAmount = userCart.cartTotal;
        }

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                createdAt: Date.now(),
                currency: "INR",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",

        }).save();

        let update =await userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id},
                    update: { $inc: { quantity: -item.count, sold: +item.count} },
                }
            }
        });

        const updated = await Product.bulkWrite(update, {});
        res.json({
            message: "success"
        });

    }catch(err) {
        throw new Error(err);
    }
});


const getOrders = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);

    try{
        const userOrders = await Order.findOne({ orderby: _id }).populate('products.product').exec();
        res.json(userOrders);
    }catch(err) {
        throw new Error(err);
    }
});

const updateOrderStatus = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    validateMongodbId(id);

    try{
        updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status: status
                },
            },
            {
                new: true
            }
        );
        res.json(updatedOrder);

    }catch(err) {
        throw new Error(err);
    }
})

module.exports = { 
    createUser,
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
    getUserWishlist,
    saveUserAddress,
    userCart,
    getUserCart,
    removeCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
};