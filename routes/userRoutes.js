const express = require("express");
const {
  loginUser,
  getUser,
  getCurrentUser,
  register,
  updateUser,
  profilePicMiddleware,
} = require("../handlers/userHandler");

const { checkAuth } = require("../middlewares/checkAuth");

const router = express.Router();

//Get current User
router.get("/current-user", checkAuth, getCurrentUser);

//Register User
router.post("/register", register);

//Login User
router.post("/login", loginUser);

//Get User By id
router.get("/:userId", getUser);

//Update user profile
router.post("/update/:userId", profilePicMiddleware, updateUser);

module.exports = router;
