const express = require('express');
const { authMiddleware, isAdmin } = require('../midlewares/authmiddleware');
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages } = require('../controllers/blogController');
const { uploadPhotos, blogImageresize } = require('../midlewares/uploadImages');
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createBlog);
router.get('/', getAllBlogs);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhotos.array('images', 10), blogImageresize, uploadImages);
router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, dislikeBlog);
router.get('/:id', getBlog);
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.delete('/:id', deleteBlog);




module.exports = router;