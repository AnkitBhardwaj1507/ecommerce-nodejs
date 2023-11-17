const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "../public/images"));

    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
    },
});

const multerFilter = (req, file, cb) => {
    if(file.mimeType.startsWith(image)) {
        cb(null, true);
    }else {
        cb(
            {
                message: "Unsupported file format",
            },
            false
        );
    }
};

const uploadPhotos = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fieldSize: 2000000}
});

const productImageResize = async(req, res, next) => {
    if(!req.file) return next();

    await Promise.all(
        req.files.map(async(file) => {
            await sharp(file.path).resize(300, 300)
            .toFormat('jpeg')
            .jpeg({quaity: 90})
            .toFile(`public/images/products/${file.filename}`);
            fs.unlinkSync(`public/images/products/${file.filename}`);
        })
    );
    next();
}

const blogImageresize = async(req, res, next) => {
    if(!req.file) return next();
    
    await Promise.all(
        req.files.map(async(file) => {
            await sharp(file.path).resize(300, 300)
            .toFormat('jpeg')
            .jpeg({quaity: 90})
            .toFile(`public/images/blogs/${file.filename}`);
            fs.unlinkSync(`public/images/blogs/${file.filename}`);
        })
    );
    next();
}


module.exports = {
    uploadPhotos, productImageResize, blogImageresize
}