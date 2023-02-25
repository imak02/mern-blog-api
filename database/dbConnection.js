const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const dbConnection = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://imak02:imak02@mern-app.axvglq4.mongodb.net/mern-blog?retryWrites=true&w=majority"
    );
    console.log("Connected to Database");
  } catch (error) {
    console.log(error);
  }
};

dbConnection();
