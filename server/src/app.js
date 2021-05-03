const express = require("express");
const path = require("path");
require("./db/mongoose.js");
require("dotenv").config();

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

//Parse json post input (instead of urlencoded)
app.use(express.json());

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, "../../react-ui/build")));

//user router
app.use(userRouter);
//task router
app.use(taskRouter);

// All remaining requests return the React app, so it can handle routing.
app.get("*", function (req, res) {
  res.sendFile(path.resolve(__dirname, "../../react-ui/build", "index.html"));
});

module.exports = app;
