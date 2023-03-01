const express = require("express");
const multer = require("multer");
const {
  getBlogs,
  createBlog,
  getBlog,
  uploadBlogImage,
  imageMiddleware,
} = require("../handlers/blogHandler");
const storage = require("../utils/multer");

const router = express.Router();

//Get all blogs
router.get("/", getBlogs);

//Get blog by id
router.get("/:blogId", getBlog);

//Create a new blog
router.post("/new", imageMiddleware, createBlog);

module.exports = router;
