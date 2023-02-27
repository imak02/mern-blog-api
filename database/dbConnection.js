const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database");
  } catch (error) {
    console.log(error);
  }
};

dbConnection();
