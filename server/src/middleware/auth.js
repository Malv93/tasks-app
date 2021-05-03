const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    //Get the token from the request header
    const token = req.header("Authorization").replace("Bearer ", "");
    // console.log(token); //debug
    //Decode the token and get the _id stored inside it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded); //debug
    //Find the user with the corresponding id
    //and with the token inside his tokens array
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    //store the found user and the token and send it to next operation (route handler)
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
