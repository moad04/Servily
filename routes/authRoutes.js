const express = require("express");
const path = require("path");
const Router = express.Router();
const { createUser, checkUser } = require("../controllers/authController");
const passport = require("../config/passport");

Router.get("/", (req, res) => {
  res.render("index");
});

Router.get("/signup", (req, res) => {
  res.render("signup", { messages: req.flash() });
});
Router.get("/login", (req, res) => {
  res.render("login", { messages: req.flash() });
});

Router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true,
  }),
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

module.exports = Router;
