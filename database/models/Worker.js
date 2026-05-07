const mongoose = require("mongoose");
const { userCollection } = require("./User");

const workerSchema = new mongoose.Schema({
  workerType: { type: String, enum: ["company", "individual"] },
  skills: {
    type: [String],
  },
  bio: { type: String },
  isavailable: { type: Boolean, default: true },
});

const Worker = userCollection.discriminator("worker", workerSchema);
module.exports = Worker;
