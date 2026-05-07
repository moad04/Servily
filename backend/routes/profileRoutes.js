const express = require("express");
const Router = express.Router();
const Rating = require("../database/models/Rating");

const profileController = require("../controllers/profileController");
const skillsList = require("../config/skills");
const upload = require("../config/upload");
Router.get("/", async (req, res) => {
  try {
    const user = req.session.user || req.user;
    const ratings = await Rating.find({ target: user._id });
    const ratingCount = ratings.length;
    const ratingSum = ratings.reduce((acc, item) => acc + item.rating, 0);
    if (!user) {
      return res.redirect("/login");
    }

    if (user.role === "client") {
      return res.render("client-profile", {
        user,
        ratings,
        ratingCount,
        ratingSum,
      });
    }

    if (user.role === "worker") {
      return res.render("worker-profile", {
        user,
        ratings,
        ratingCount,
        ratingSum,
      });
    }
  } catch (error) {}
});

Router.route("/edit")
  .get((req, res) => {
    const user = req.session.user || req.user;

    if (!user) {
      return res.redirect("/login");
    }

    return res.render("edit-user", {
      user,
      skills: skillsList,
    });
  })
  .post(upload.single("profilePic"), profileController.updateUser);

Router.get("/:id", profileController.getProfile);

Router.post("/deleteProfile", profileController.deleteUser);

module.exports = Router;
