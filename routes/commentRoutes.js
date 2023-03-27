const express = require("express");

const { getComments, addComment } = require("../handlers/commentHandler");

const { checkAuth } = require("../middlewares/checkAuth");

const router = express.Router();

//Get comments by blogId
router.get("/:blogId", getComments);

//Create a new comment
router.post("/add/:blogId", checkAuth, addComment);

module.exports = router;
