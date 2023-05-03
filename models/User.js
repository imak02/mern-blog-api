const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
  },
  bio: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  otp: {
    type: Number,
  },
  emailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String },
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
});

// userSchema.pre("save", async function (next) {
//   //Works if password is modified
//   if (this.isModified("password")) {
//     const hashedPassword = await bcrypt.hash(this.password, 12);
//     this.password = hashedPassword;
//   }
//   next();
// });

userSchema.methods.generateEmailVerifyToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  const expiration = Date.now() + 30 * 60 * 1000;
  const emailVerifyToken = token + ":" + expiration;
  this.emailVerifyToken = emailVerifyToken;

  return emailVerifyToken;
};

userSchema.methods.generateOTP = function () {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  this.otp = OTP;
  // Set a timeout to delete the OTP after 30 minutes (1800000 milliseconds)
  setTimeout(() => {
    this.model("User")
      .findOneAndUpdate(
        { _id: this._id },
        { $unset: { otp: 1 } },
        { new: true }
      )
      .exec();
  }, 300000);
  return OTP;
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
