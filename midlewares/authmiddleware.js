const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async(req, res, next) => {
    let token;

    if(req?.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            if(token) {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decode?.id);
                req.user = user;
                next();
            }
        }catch(error) {
            throw new Error('Not Found, Please login again');
        }
    }else {
        throw new Error('There is no token attached to header');
    }
})

const isAdmin = asyncHandler(async (req, res, next) => {
    const {email} = req.user;
    const isUserAdmin = await User.findOne({email});
    if(isUserAdmin.role !== 'admin') {
        throw new Error('You are not authorised');
    }else {
        next();
    }
})

module.exports = { authMiddleware, isAdmin }