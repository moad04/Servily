const { userCollection } = require("../database/models/User");
const Client = require("../database/models/Client");
const Worker = require("../database/models/Worker");
const Task = require("../database/models/Task");
const Rating = require("../database/models/Rating");

exports.updateUser = async (req, res) => {
  try {
    const user = req.session.user || req.user;
    const {
      firstName,
      lastName,
      location,
      phone,
      workerType,
      skills,
      bio,
      isAvailable,
    } = req.body;
    const userId = user._id;
    let profilePicPath = user.profilePic;
    if (req.file) {
      profilePicPath = `/uploads/profile/${req.file.filename}`;
    }
    console.log("FILE:", req.file);
    if (user.role === "client") {
      const updateClient = await Client.findByIdAndUpdate(
        userId,
        {
          firstName: firstName,
          lastName: lastName,
          location: location,
          profilePic: profilePicPath,
          phone: phone,
        },
        { new: true },
      );
      req.session.user = updateClient;
    } else if (user.role === "worker") {
      const updateWorker = await Worker.findByIdAndUpdate(
        userId,
        {
          firstName: firstName,
          lastName: lastName,
          location: location,
          profilePic: profilePicPath,
          phone: phone,
          workerType: workerType,
          skills: skills,
          bio: bio,
          isAvailable: isAvailable,
        },
        { new: true },
      );
      req.session.user = updateWorker;
    }
    return res.redirect("/profile");
  } catch (error) {
    console.log(error);
    return res.redirect("/profile");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = req.session.user || req.user;

    if (!user) {
      return res.redirect("/login");
    }

    const userId = user._id;

    await userCollection.findByIdAndDelete(userId);

    req.session.destroy((err) => {
      if (err) {
        req.flash("error", err);
        return res.redirect("/profile");
      }

      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/profile");
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const profileUser = await userCollection.findById(userId);
    const tasks = await Task.find({ client: userId });
    const ratings = await Rating.find({ target: userId }).populate(
      "reviewer",
      "firstName lastName",
    );
    let averageRating = 0;
    let ratingCount = ratings.length;
    let ratingSum = 0;
    if (ratingCount > 0) {
      ratingSum = ratings.reduce((acc, item) => acc + item.rating, 0);
      averageRating = ratingSum / ratingCount;
    }
    if (!profileUser) {
      req.flash("error", "Profile not found");
      return res.redirect("back");
    }

    // Check role and render appropriate template
    if (profileUser.role === "worker") {
      return res.render("view-worker-profile", {
        worker: profileUser,
        user: req.session.user || req.user,
        ratings: ratings,
        averageRating: averageRating,
        ratingCount: ratingCount,
        ratingSum: ratingSum,
        messages: req.flash(),
      });
    } else {
      return res.render("view-profile", {
        client: profileUser,
        tasks,
        user: req.session.user || req.user,
        ratings: ratings,
        averageRating: averageRating,
        ratingCount: ratingCount,
        ratingSum: ratingSum,
        messages: req.flash(),
      });
    }
  } catch (error) {
    req.flash("error", "An error occured");
    console.log(error);
    return res.redirect("back");
  }
};
