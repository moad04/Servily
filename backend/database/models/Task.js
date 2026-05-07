const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  wilaya: { type: String, required: true },
  baladiya: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["Open", "In progress", "Completed"],
    default: "Open",
  },
  neededWorkers: { type: Number, default: 1, min: 1 },
  createdAt: { type: Date, default: Date.now },
  picture: { type: String },
});

const taskCollection = mongoose.model("Task", taskSchema);
module.exports = taskCollection;
