const express = require("express");
const {
  getBlogs,
  createBlog,
  getBlog,
  imageMiddleware,
} = require("../handlers/blogHandler");

const { checkAuth } = require("../middlewares/checkAuth");

const router = express.Router();

//Get all blogs
router.get("/", getBlogs);

//Get blog by id
router.get("/:blogId", checkAuth, getBlog);

//Create a new blog
router.post("/new", checkAuth, imageMiddleware, createBlog);

module.exports = router;
