const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    googleId: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["client", "worker"],
      required: true,
    },
    location: { type: String },
    profilePic: { type: String },
    createdAt: { type: Date, default: Date.now },
    phone: { type: String },
  },
  { discriminatorKey: "role" },
);

const userCollection = mongoose.model("User", userSchema);
module.exports = {
  userSchema,
  userCollection,
};
