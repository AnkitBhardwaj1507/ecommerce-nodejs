const Color = require('../models/color');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');

const createColor = asyncHandler(async(req, res) => {
    try {
        const newColor = await Color.create(req.body);
        res.json(newColor);
    }catch(err) {
        throw new Error(err);
    }
});

const updateColor = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedColor = await Color.findByIdAndUpdate(
            id,
            req.body,
            { new : true }
        );
        res.json(updatedColor);
    }catch(err) {
        throw new Error(err);
    }
});

const getColor = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const color = await Color.findById(id);
        res.json(color);
    }catch(err) {
        throw new Error(err);
    }
});

const getAllColor = asyncHandler(async(req, res) => {
    try {
        const allColors = await Color.find({});
        res.json(allColors);
    }catch(err) {
        throw new Error(err);
    }
});

const deleteColor = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const deletedColor = await Color.findByIdAndDelete(id);
        res.json(deletedColor);
    }catch(err) {
        throw new Error(err);
    }
});


module.exports = {
    createColor,
    updateColor,
    deleteColor,
    getColor,
    getAllColor
}

