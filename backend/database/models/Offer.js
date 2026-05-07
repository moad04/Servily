const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  status: {
    type: String,
    enum: ["Accepted", "Rejected", "Pending"],
    default: "Pending",
  },
});
const offerCollection = mongoose.model("Offer", offerSchema);
module.exports = offerCollection;
