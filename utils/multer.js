const multer = require("multer");
const fs = require("fs");

const destinationFolder = "uploads/";

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }
    cb(null, destinationFolder);
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

module.exports = { multerStorage, multerFilter };
