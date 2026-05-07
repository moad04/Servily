const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  target: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  reviewerEmail: {
    type: String,
    required: true,
  },

  comment: { type: String },
});

ratingSchema.index({ reviewerEmail: 1, target: 1 }, { unique: true });
module.exports = mongoose.model("Rating", ratingSchema);
