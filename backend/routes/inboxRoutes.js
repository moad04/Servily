const express = require("express");
const Router = express.Router();
const inboxController = require("../controllers/inboxController");

Router.get("/", inboxController.getInbox);
Router.get("/unread-count", inboxController.getUnreadCount);
Router.get("/recent", inboxController.getRecentNotifications);
Router.post("/mark-read", inboxController.markAsRead);
Router.get("/admin-unread-count", inboxController.getAdminUnreadCount);
Router.get("/admin-requests", inboxController.getAdminVerificationRequests);

module.exports = Router;
