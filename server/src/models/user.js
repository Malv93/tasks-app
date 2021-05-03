const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("./task");
require("dotenv").config();

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true, //can't have two equal email in the collection
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("The password can't include the word 'password'");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

//Set Relationship with task
//where tasks is a virtual field that can be populated
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

//Custom methods for documents

//NB: arrow => functions can't use "this" keyword!

//NB: I am overriting toJSON method
//Express runs every time the document is sent .stringify(object)
//.toJSON is run every time .stringify runs
userSchema.methods.toJSON = function () {
  const user = this;
  //convert document to object
  const userObject = user.toObject();

  //Remove sensitive data
  delete userObject.password;
  delete userObject.tokens;
  //Remove heavy avatar binary data
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  //Create token, using a sectret String and user id
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  //store the token in the document
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//Custom function for Model
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

//Hash before saving
//Add a function that triggers before saving (pre)
userSchema.pre("save", async function (next) {
  const user = this; //this reference the document thath will be saved

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  //End of operations, now the document can be saved
  next();
});

//Delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
