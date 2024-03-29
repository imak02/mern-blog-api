const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const errorHandler = require("../utils/errorHandler");
const registerValidatorSchema = require("../utils/registerValidator");
const multer = require("multer");
const { multerFilter, profileMulterStorage } = require("../utils/multer");
const sendMail = require("../utils/nodeMailer");

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

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      userName,
      email,
      password: hashedPassword,
    });

    const token = newUser.generateEmailVerifyToken();
    newUser.save();

    sendMail({
      to: email,
      subject: "Email Verification",
      text: "Please verify your mail to continue.",
      html: `Please click <a href="http://localhost:8000/user/verify?token=${token}">here</a> to verify your email address. This link will expire in 30 minutes.`,
    });

    if (newUser) {
      return res.status(200).send({
        success: true,
        message:
          "User registered successfully. Please check your email for verification link.",
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

//Verify email address
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  const [tokenValue, expiration] = token.split(":");

  console.log(tokenValue);

  if (!tokenValue || !expiration) {
    return res
      .status(400)
      .send({ success: false, message: "Invalid token", data: null });
  }

  const expirationTime = parseInt(expiration);

  if (expirationTime < Date.now()) {
    res
      .status(400)
      .send({ success: false, message: "Token has expired", data: null });
    return;
  }

  try {
    const verifiedUser = await User.findOneAndUpdate(
      { emailVerifyToken: token },
      { emailVerified: true, emailVerifyToken: null },
      { new: true }
    );

    console.log(verifiedUser);

    if (verifiedUser) {
      res.status(200).send("Email Address verified!!!");
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Resend verification email
const resendVerificationEmail = async (req, res) => {
  const user = req.user;
  const userId = user._id;
  try {
    const foundUser = await User.findById(userId);
    const email = foundUser.email;
    console.log(foundUser);
    const token = await foundUser.generateEmailVerifyToken();
    foundUser.save();

    sendMail({
      to: email,
      subject: "Email Verification",
      text: "Please verify your mail to continue.",
      html: `Please click <a href="http://localhost:8000/user/verify?token=${token}">here</a> to verify your email address. This link will expire in 30 minutes.`,
    });

    return res.status(200).send({
      success: true,
      message: "Please check your email for verification link",
      data: email,
    });
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

    //Checking if email is updated or same to change the verification status
    const foundUser = await User.findById(userId);
    if (foundUser.email !== email.trim()) {
      emailVerified = false;
    } else {
      emailVerified = foundUser.emailVerified;
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
        emailVerified,
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

//Change Password
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const { oldP, newP } = req.body;

    const foundUser = await User.findOne({
      userId,
    }).select(["userName", "email", "password"]);

    if (!foundUser) {
      return res.status(400).send({
        success: false,
        message: "User does not exist.",
        data: null,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(oldP, foundUser.password);

    if (!isPasswordCorrect) {
      return res.status(400).send({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(newP, 12);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { returnDocument: "after" }
    );

    if (updatedUser) {
      return res.status(200).send({
        success: true,
        message: "Password changed successfully",
        data: null,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email must be included.",
        data: null,
      });
    }

    const foundUser = await User.findOne({ email: email.trim() });

    if (!foundUser) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid email address",
        data: null,
      });
    }

    foundUser.generateOTP();
    foundUser.save();

    sendMail({
      to: email,
      subject: "Password Reset",
      text: "Use the otp below to reset your password",
      html: `Your password reset otp is ${foundUser.otp}. This otp will expire in 5 minutes.`,
    });

    return res.status(200).send({
      success: true,
      message: "Please check your email for password reset code",
      data: email,
    });
  } catch (error) {
    errorHandler({ error, res });
  }
};

//Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).send({
        success: false,
        message: "Incomplete details",
        data: null,
      });
    }

    const foundUser = await User.findOne({ email: email.trim() });

    if (!foundUser) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid email address",
        data: null,
      });
    }

    if (foundUser.otp !== otp) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid otp",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const changedPassword = await User.findOneAndUpdate(
      { email: email.trim() },
      { password: hashedPassword },
      { new: true }
    );

    if (changedPassword) {
      return res.status(200).send({
        success: true,
        message: "Password changed successfully",
        data: null,
      });
    }
  } catch (error) {
    errorHandler({ error, res });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  getUser,
  getCurrentUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  profilePicMiddleware,
};
