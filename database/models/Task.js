const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["Open", "In progress", "Completed"],
    default: "Open",
  },
  createdAt: { type: Date, default: Date.now },
});

const taskCollection = mongoose.model("Task", taskSchema);
module.exports = taskCollection;
