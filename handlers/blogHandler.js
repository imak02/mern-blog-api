const Blog = require("../models/Blog");
const errorHandler = require("../utils/errorHandler");

//Get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

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

    const createdBlog = await Blog.create({
      title,
      description,
      content,
    });

    if (createdBlog) {
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

    const foundBlog = await Blog.findById(blogId);

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

module.exports = { getBlogs, createBlog, getBlog };
