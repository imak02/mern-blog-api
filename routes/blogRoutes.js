const express = require("express");
const { getBlogs, createBlog, getBlog } = require("../handlers/blogHandler");

const router = express.Router();

//Get all blogs
router.get("/", getBlogs);

//Get blog by id
router.get("/:blogId", getBlog);

//Create a new blog
router.post("/new", createBlog);

module.exports = router;
