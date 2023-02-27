const express = require("express");
const {
  addUser,
  loginUser,
  getUser,
  getCurrentUser,
} = require("../handlers/userHandler");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

//Register User
router.post("/register", addUser);

//Login User
router.post("/login", loginUser);

//Get User By id
router.get("/:userId", getUser);

//Get current User
router.get("/current", checkAuth, getCurrentUser);

module.exports = router;
