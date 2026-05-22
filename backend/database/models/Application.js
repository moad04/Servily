const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.ObjectId,
    ref: "Task",
    required: true,
  },

  worker: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
