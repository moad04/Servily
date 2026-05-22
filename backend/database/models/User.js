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
    isIdVerified: {
      type: Boolean,
      default: false,
    },
    idPhoto: {
      type: String,
      default: null,
    },
    idVerificationStatus: {
      type: String,
      enum: ["not verified", "pending", "verified", "rejected"],
      default: "not verified",
    },
    idVerificationMessage: {
      type: String,
      default: null,
    },
    idFirstName: { type: String, default: null },
    idLastName: { type: String, default: null },
    idDateOfBirth: { type: Date, default: null },
    idPlaceOfBirth: { type: String, default: null },
    idNumber: { type: String, default: null },
    idType: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
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
