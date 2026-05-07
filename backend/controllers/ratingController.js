const { userCollection } = require("../database/models/User");
const Rating = require("../database/models/Rating");

exports.ratingSystem = async (req, res) => {
  try {
    const { rating, targetId } = req.body;
    const reviewerId = req.session.user || req.user;

    if (!reviewerId) {
      req.flash("error", "You must be logged in to rate");
      return res.redirect(`/profile/${targetId}`);
    }

    const ratingNum = Number(rating);

    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      req.flash("error", "Rating must be between 1 and 5");
      return res.redirect(`/profile/${targetId}`);
    }

    if (!targetId) {
      req.flash("error", "No user specified to rate");
      return res.redirect("/");
    }

    if (reviewerId.toString() === targetId.toString()) {
      req.flash("error", "You cannot rate yourself");
      return res.redirect(`/profile/${targetId}`);
    }

    const reviewer = await userCollection.findById(reviewerId);

    if (!reviewer || !reviewer.email) {
      req.flash("error", "Reviewer not found");
      return res.redirect(`/profile/${targetId}`);
    }

    const existingRating = await Rating.findOne({
      reviewerEmail: reviewer.email,
      target: targetId,
    });

    if (existingRating) {
      req.flash("error", "You already rated this user");
      return res.redirect(`/profile/${targetId}`);
    }

    await Rating.create({
      reviewer: reviewerId,
      reviewerEmail: reviewer.email,
      target: targetId,
      rating: ratingNum,
    });

    const allRatings = await Rating.find({ target: targetId });
    const count = allRatings.length;
    const sum = allRatings.reduce((acc, item) => acc + item.rating, 0);
    const average = sum / count;

    await userCollection.findByIdAndUpdate(targetId, {
      ratingSum: sum,
      ratingCount: count,
      rating: average.toFixed(1),
    });

    req.flash("success", "Rating submitted successfully!");
    return res.redirect(`/profile/${targetId}`);
  } catch (error) {
    const targetId = req.body.targetId;
    console.error("Rating error details:", error);

    if (error.code === 11000) {
      req.flash("error", "You already rated this user");
    } else {
      req.flash("error", "Failed to submit the rating");
    }
    return res.redirect(`/profile/${targetId}`);
  }
};
