require("dotenv").config();
require("./database/dbConnection");
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("This is a server for Wordify and it is up and running...");
});

//User Routes
app.use("/user", userRoutes);

//Blog Routes
app.use("/blog", blogRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
