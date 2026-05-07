const express = require("express");
const path = require("path");
const Router = express.Router();
const {
  createUser,
  checkUser,
  showVerifyPage,
  verifyEmail,
  resesndVerification,
} = require("../controllers/authController");
const Worker = require("../database/models/Worker");
const Task = require("../database/models/Task");
const passport = require("../config/passport");
const Notification = require("../database/models/Notification");

Router.get("/", async (req, res) => {
  const user = req.session.user || req.user;
  const tasks = await Task.find().populate("client");
  if (!user) {
    return res.render("index");
  }
  if (user.role === "client") {
    const workers = await Worker.find();
    const unreadNotifications = await Notification.find({
      userId: user._id,
      type: "new_applications",
      read: false,
    });
    const hasNewApplications = unreadNotifications.length > 0;
    const newApplicationsCount = unreadNotifications.length;
    return res.render("index-client", {
      user,
      workers,
      tasks,
      hasNewApplications: hasNewApplications,
      newApplicationsCount: newApplicationsCount,
      messages: req.flash(),
    });
  } else if (user.role === "worker") {
    const unreadRejections = await Notification.find({
      userId: user._id,
      type: "application_rejected",
      read: false,
    });
    const hasRejectionNotification = unreadRejections.length > 0;
    const rejectionCount = unreadRejections.length;
    return res.render("index-worker", {
      user,
      tasks,
      hasRejectionNotification: hasRejectionNotification,
      rejectionCount: rejectionCount,
      messages: req.flash(),
    });
  }
});

Router.get("/signup", (req, res) => {
  return res.render("signup", { messages: req.flash() });
});
Router.get("/verify-email", showVerifyPage);
Router.post("/verify-email", verifyEmail);
Router.get("/resend-verification", resesndVerification);
Router.get("/login", (req, res) => {
  return res.render("login", { messages: req.flash() });
});

Router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/signup",
    failureFlash: true,
  }),
  (req, res) => {
    res.render("redirect", { user: req.user });
  },
);

Router.get("/auth/google/signup/:role", (req, res, next) => {
  const role = req.params.role;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: `signup:${role}`,
  })(req, res, next);
});

Router.get(
  "/auth/google/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "login",
  }),
);

Router.post("/signup", createUser);
Router.post("/login", checkUser);
Router.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  });
});

module.exports = Router;
