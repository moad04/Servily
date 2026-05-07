const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    googleId: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["client", "worker"],
      required: true,
    },
    location: { type: String },
    profilePic: { type: String },
    createdAt: { type: Date, default: Date.now },
    phone: { type: String },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
  },
  { discriminatorKey: "role" },
);

const userCollection = mongoose.model("User", userSchema);
module.exports = {
  userSchema,
  userCollection,
};
