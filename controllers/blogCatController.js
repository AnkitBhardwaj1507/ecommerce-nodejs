const Category = require('../models/blogCat');
const asyncHandler = require(express-async-handler);
const validateMongodbId = require('../utils/validateMongodbId');

const createCategory = asyncHandler(async(req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    }catch(err) {
        throw new Error(err);
    }
});

const updateCategory = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedCategory);
    }catch(err) {
        throw new Error(err);
    }
});

const deleteCategory = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    }catch(err) {
        throw new Error(err);
    }
});

const getCategory = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const category = await Category.findById(id);
        res.json(category);
    }catch(err) {
        throw new Error(err);
    }
});

const getAllCategory = asyncHandler(async(req, res) => {
    try {
        const allCategory = await Category.find();
        res.json(allCategory);
    }catch(err) {
        throw new Error(err);
    }
});

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getAllCategory
}