const fs = require('fs');
const User = require("../models/user");
const Blog = require("../models/blog");
const asyncHandler = require('express-async-handler');
const validateMongodbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const Product = require("../models/product");

const createBlog = asyncHandler(async(req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json( {
            status:'success',
            newBlog
        })
    }catch(err) {
        throw new Error(err);
    }
});

const updateBlog = asyncHandler(async(req, res) => {
    try {
        const { id } = req.params;
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {new: true});
        res.json(updatedBlog);
    }catch(err) {
        throw new Error(err);
    }
});

const getBlog = asyncHandler(async(req, res) => {
    const { id } = req.params;
    try {
        const getBlog = await Blog.findById(id).populate(likes).populate(dislikes);
        await Blog.findByIdAndUpdate(id, {
            $inc: {
                numViews: 1
            }, 
        }, {
            new: true
        });
        res.json(getBlog);
    }catch(err) {
        throw new Error(err);
    }
});


const getAllBlogs = asyncHandler(async(req, res) => {
    try {
        const allBlogs = await Blog.find({});
        res.json(allBlogs);
    }catch(err) {
        throw new Error(err);
    }
    
});

const deleteBlog = asyncHandler(async(req, res) => {
    const { id } = req.params;
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog);
    }catch(err) {
        throw new Error(err);
    }
});

const likeBlog = asyncHandler(async(req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    //Find the blog which user want to like or dislike
    const blog = await Blog.findById(blogId);

    //Find the user
    const loggedInUserId = req?.user?._id;

    //Find wheather user already liked the Blog
    const isLiked = blog?.isLiked;

    //Find wheather user already disliked the Blog
    const alreadyDisliked = blog?.dislikes?.find(
        (userId) => userId?.toString() === loggedInUserId?.toString()
    );

    if(alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {
                    dislikes: loggedInUserId
                },
                isDisliked: false
            },
            {
                new: true
            }
        );
        res.json(blog);
    }

    if(isLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {
                    likes: loggedInUserId
                },
                isLiked: false,
            }, {
                new: true
            }
        );
        res.json(blog);
    }else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: {
                    likes: loggedInUserId
                },
                isLiked: true,
            },
            {
                new: true
            }
        );
        res.json(blog);
    }

});

const dislikeBlog = asyncHandler(async(req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    const blog = await Blog.findById(blogId);

    const loggedInUserId = req?.user?._id;

    const isDisliked = blog?.isDisliked;

    const alreadyLiked = blog?.likes?.find(
        (userId) => userId?.toString() === loggedInUserId?.toString()
    )

    if(alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: {
                    likes: loggedInUserId
                },
                isLiked: false
            }, 
            {
                new: true
            }
        );
        res.json(blog);
    }

    if(isDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blog, 
            {
                $pull: {
                    isDisliked: loggedInUserId
                },
                isDisliked: false
            }, {
                new: true,
            }
        );
        res.json(blog);
    }else {
        const blog = await Blog.findByIdAndUpdate(
            blog,
            {
                $push: {
                    dislikes: loggedInUserId
                },
                isDisliked: true
            },
            {
                new: true
            }
        );
        res.json(blog);
    }

});

const uploadImages = asyncHandler(async(req, res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;

        for(const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath);
            fs.unlinkSync(path);
        }

        const findProduct = await Product.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) => {
                    return file;
                })
            },
            {
                new: true
            }
        );

        res.json(findProduct);
    }catch(err) {
        throw new Error(err);
    }
})


module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages };