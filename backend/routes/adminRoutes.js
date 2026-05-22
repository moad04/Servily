const express = require("express");
const Router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../config/adminAuth");

Router.get(
  "/verifications",
  adminAuth,
  adminController.getPendingVerifications,
);
Router.post("/reject/:userId", adminController.rejectId);
Router.post("/approve/:userId", adminAuth, adminController.approveId);

module.exports = Router;
