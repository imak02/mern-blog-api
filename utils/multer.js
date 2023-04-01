const multer = require("multer");
const fs = require("fs");

const profileDestinationFolder = "uploads/user";
const blogDestinationFolder = "uploads/blog";

const profileMulterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(profileDestinationFolder)) {
      fs.mkdirSync(profileDestinationFolder);
    }
    cb(null, profileDestinationFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split("/")[1];
    cb(null, "profileImg" + "-" + uniqueSuffix + "." + ext);
  },
});

const blogMulterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(blogDestinationFolder)) {
      fs.mkdirSync(blogDestinationFolder);
    }
    cb(null, blogDestinationFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split("/")[1];
    cb(null, "blogImg" + "-" + uniqueSuffix + "." + ext);
  },
});

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed."), false);
  }
};

module.exports = { profileMulterStorage, blogMulterStorage, multerFilter };
