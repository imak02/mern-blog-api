const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const errorHandler = require("../utils/errorHandler");
const registerValidatorSchema = require("../utils/registerValidator");
const multer = require("multer");
const { multerFilter, profileMulterStorage } = require("../utils/multer");

//File Upload logic
const upload = multer({
  dest: "uploads/user",
  storage: profileMulterStorage,
  fileFilter: multerFilter,
});
const uploadProfilePic = upload.single("profilePic");

const profilePicMiddleware = async (req, res, next) => {
  uploadProfilePic(req, res, (error) => {
    if (error) {
      return errorHandler({ message: error.message, res });
    }
    next();
  });
};

//Create a new user (Register a new user)
const register = async (req, res) => {
  try {
    // const { name, userName, email, password } = req.body;
    const { error, value } = registerValidatorSchema.validate(req.body);

    if (error) {
      return res.status(400).send({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    let { fullName: name, userName, email, password1: password } = await value;

    const emailAlreadyExists = await User.exists({ email: email.trim() });
    if (emailAlreadyExists) {
      return res.status(400).send({
        success: false,
        message: "Email is already registered.",
        data: null,
      });
    }

    const userNameNotAvailable = await User.exists({
      userName: userName.trim(),
    });
    if (userNameNotAvailable) {
      return res.status(400).send({
        success: false,
        message: "Username is already taken.",
        data: null,
      });
    }

    const newUser = await User.create({
      name,
      userName,
      email,
      password,
    });

    if (newUser) {
      return res.status(200).send({
        success: true,
        message: "User registered successfully",
        data: {
          name: newUser.name,
          userName: newUser.userName,
          email: newUser.email,
        },
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Login the user
const loginUser = async (req, res, next) => {
  const { user, password } = req.body;
  try {
    const foundUser = await User.findOne({
      $or: [{ email: user }, { userName: user }],
    }).select(["userName", "email", "password"]);

    if (!foundUser) {
      return res.status(400).send({
        success: false,
        message: "User does not exist.",
        data: null,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).send({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const token = foundUser.generateToken();

    return res.status(200).send({
      success: true,
      message: "Login Successful",
      data: { userName: foundUser.userName, email: foundUser.email, token },
    });
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Get a user with userid
const getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const foundUser = await User.findById(userId).populate("blogs");

    if (!foundUser) {
      return res.status(400).send({
        success: false,
        message: "The requested user does not exist.",
        data: null,
      });
    }

    return res.status(200).send({
      success: true,
      message: "User fetched successfully",
      data: foundUser,
    });
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Fetch current User
const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    const currentUser = await User.findOne({
      _id: mongoose.Types.ObjectId(user._id.toString()),
    });
    if (!currentUser) {
      return res.status(400).send({
        success: false,
        message: "The requested user does not exist",
        data: null,
      });
    }

    return res.status(200).send({
      success: true,
      message: "The requested user was found",
      data: currentUser,
    });
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Update user profile
const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, userName, email, bio } = req.body;

    const emailAlreadyExists = await User.findOne({ email: email.trim() });
    if (emailAlreadyExists) {
      if (emailAlreadyExists._id.toString() !== userId) {
        return res.status(400).send({
          success: false,
          message: "Email is already registered.",
          data: null,
        });
      }
    }

    const userNameNotAvailable = await User.findOne({
      userName: userName.trim(),
    });
    if (userNameNotAvailable) {
      if (userNameNotAvailable._id.toString() !== userId) {
        return res.status(400).send({
          success: false,
          message: "Username is already taken.",
          data: null,
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        profilePic: req.file && `/${req.file.path}`,
        name,
        userName,
        email,
        bio,
      },
      { new: true }
    );

    if (updatedUser) {
      return res.status(200).send({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

module.exports = {
  register,
  loginUser,
  getUser,
  getCurrentUser,
  updateUser,
  profilePicMiddleware,
};
