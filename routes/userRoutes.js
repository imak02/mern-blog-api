const express = require("express");
const {
  loginUser,
  getUser,
  getCurrentUser,
  register,
  updateUser,
  profilePicMiddleware,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} = require("../handlers/userHandler");

const { checkAuth } = require("../middlewares/checkAuth");

const router = express.Router();

//Get current User
router.get("/current-user", checkAuth, getCurrentUser);

//Register User
router.post("/register", register);

//Verify Email Address
router.get("/verify", verifyEmail);

//Resend Email Address verification link
router.get("/resend-link", checkAuth, resendVerificationEmail);

//Login User
router.post("/login", loginUser);

//Get User By id
router.get("/:userId", getUser);

//Update user profile
router.post("/update/:userId", checkAuth, profilePicMiddleware, updateUser);

//Change Password
router.patch("/changePassword/:userId", checkAuth, changePassword);

//Forgot Password
router.post("/forgot-password", forgotPassword);

//Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;
