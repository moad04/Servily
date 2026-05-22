const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "new_applications",
      "application_rejected",
      "application_accepted",
      "id_verified",
      "id_pending",
      "id_rejected",
      "new_id_request",
    ],
    required: true,
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  message: { type: String, required: true },
});

module.exports = mongoose.model("Notification", notificationSchema);
