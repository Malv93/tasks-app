const mongoose = require("mongoose");
const validator = require("validator");

//itemSchema
const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    hashtag: {
      type: String,
      default: "",
    },
    important: {
      type: Boolean,
      default: false,
    },
    urgent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//item model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
