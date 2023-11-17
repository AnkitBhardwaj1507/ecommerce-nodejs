const Brand = require('../models/brand');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');

const createBrand = asyncHandler(async(req, res) => {
    try{
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    }catch(err) {
        throw new Error(err);
    }
});

const updateBrand = asyncHandler(async(req, res) => {

    const { id } = req.params;
    validateMongodbId(id);
    try{
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedBrand);
    }catch(err) {
        throw new Error(err);
    }
});

const deleteBrand = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand);
    }catch(err) {
        throw new Error(err);
    }
});

const getBrand = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const brand = await Brand.findById(id);
        res.json(brand);
    }catch(err) {
        throw new Error(err);
    }
});

const getAllBrand = asyncHandler(async(req, res) => {
    try {
        const allBrand = await Brand.find();
        res.json(allBrand);
    }catch(err) {
        throw new Error(err);
    }
});

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrand
}