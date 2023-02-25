const express = require("express");
require("./database/dbConnection");
const cors = require("cors");

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/posts", (req, res) => {
  res.send("This is a post routes");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
