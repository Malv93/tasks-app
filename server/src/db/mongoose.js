const mongoose = require("mongoose");
require("dotenv").config();

//Set for test env
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: true, //Necessary to use unique in userSchema.email
});
