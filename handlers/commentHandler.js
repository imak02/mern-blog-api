const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const errorHandler = require("../utils/errorHandler");

const addComment = async (req, res) => {
  const { comment } = req.body;
  const blogId = req.params.blogId;
  const userId = req.user._id;
  const blog = await Blog.findById(blogId);

  try {
    const commentData = await Comment.create({
      commenter: userId,
      blog: blogId,
      comment,
    });

    if (commentData) {
      blog.comments.push(commentData);
      blog.save();
      return res.status(200).send({
        success: true,
        message: "Comment added successfully",
        data: commentData,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

const getComments = async (req, res) => {
  const blogId = req.params.blogId;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(400).send({
        success: false,
        message: "The requested blog could not be found.",
        data: null,
      });
    }

    const comments = await Comment.find({ blog: blogId })
      .populate("commenter")
      .sort({ createdAt: "desc" });
    if (comments) {
      return res.status(200).send({
        success: true,
        message: "Comments fetched successfully",
        data: comments,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

module.exports = { addComment, getComments };
