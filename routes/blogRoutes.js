const express = require("express");
const {
  getBlogs,
  createBlog,
  getBlog,
  deleteBlog,
  editBlog,
  blogImageMiddleware,
} = require("../handlers/blogHandler");

const { checkAuth } = require("../middlewares/checkAuth");

const router = express.Router();

//Get all blogs
router.get("/", getBlogs);

//Get blog by id
router.get("/:blogId", getBlog);

//Create a new blog
router.post("/new", checkAuth, blogImageMiddleware, createBlog);

//Edit a blog
router.put("/:blogId", checkAuth, blogImageMiddleware, editBlog);

//Delete a blog
router.delete("/:blogId", checkAuth, deleteBlog);

module.exports = router;
