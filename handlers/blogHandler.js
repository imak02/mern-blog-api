const multer = require("multer");
const User = require("../models/User");
const Blog = require("../models/Blog");
const errorHandler = require("../utils/errorHandler");
const { multerStorage, multerFilter } = require("../utils/multer");

//File Upload logic
const upload = multer({
  dest: "uploads/",
  storage: multerStorage,
  fileFilter: multerFilter,
  //If you want to limit file size, use this
  //   limits: {
  //     fileSize: 1024 * 1024,
  //   },
});
const uploadBlogImage = upload.single("image");

const imageMiddleware = async (req, res, next) => {
  uploadBlogImage(req, res, (error) => {
    if (error) {
      return errorHandler({ message: error.message, res });
    }
    next();
  });
};

//Get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name");

    if (!blogs) {
      return res.status(400).send({
        success: false,
        message: "There are no blogs available.",
        data: null,
      });
    }
    return res.status(200).send({
      success: true,
      message: "All blogs fetched successfully",
      data: blogs,
    });
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Create a new blog
const createBlog = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    // const author = user.name;

    const createdBlog = await Blog.create({
      title,
      description,
      image: req.file ? `/${req.file.path}` : null,
      content,
      author: userId,
    });

    if (createdBlog) {
      user.blogs.push(createdBlog);
      user.save();
      return res.status(200).send({
        success: true,
        message: "Blog created successfully",
        data: createdBlog,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Get specific blog
const getBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;

    const foundBlog = await Blog.findById(blogId).populate("author", "name");

    if (!foundBlog) {
      return res.status(400).send({
        success: false,
        message: "The requested blog could not be found.",
        data: null,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Blog fetched successfully.",
      data: foundBlog,
    });
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Edit blog
const editBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const { title, description, content } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    const editedBlog = await Blog.findByIdAndUpdate(
      { _id: blogId },
      {
        title,
        description,
        image: req.file && `/${req.file.path}`,
        content,
        author: userId,
      },
      { new: true }
    );

    if (editedBlog) {
      return res.status(200).send({
        success: true,
        message: "Blog edited successfully",
        data: editedBlog,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Delete the blog
const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.user._id;
    const user = await User.findById(userId);

    const deleted = await Blog.findByIdAndDelete(blogId);

    if (deleted) {
      user.blogs.pop(deleted);
      user.save();
      return res.status(200).send({
        success: true,
        message: "Blog deleted successfully.",
        data: null,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

module.exports = {
  getBlogs,
  createBlog,
  getBlog,
  editBlog,
  deleteBlog,
  uploadBlogImage,
  imageMiddleware,
};
