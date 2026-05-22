const { userCollection } = require("../database/models/User");
const Notification = require("../database/models/Notification");

exports.getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await userCollection.find({
      idPhoto: { $ne: null },
      idVerificationStatus: "pending",
    });

    res.render("admin-dashboard", {
      users: pendingUsers,
      user: req.session.user,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
};

exports.rejectId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    console.log("Extracted userId:", userId);
    console.log("Extracted reason:", reason);
    if (!reason || reason.trim() === "") {
      req.flash("error", "Please provide a reason!");
      return res.redirect("/admin/verifications");
    }
    await userCollection.findByIdAndUpdate(userId, {
      isIdVerified: false,
      idVerificationStatus: "rejected",
    });
    await Notification.create({
      userId: userId,
      type: "id_rejected",
      message: `Your ID was rejected. Reason: ${reason}`,
      read: false,
    });
    req.flash("success", "Id verification has been rejected");
    return res.redirect("/admin/verifications");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    res.redirect("/admin/verifications");
  }
};

exports.approveId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userCollection.findById(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/verifications");
    }
    const firstName = user.idFirstName;
    const lastName = user.idLastName;
    await userCollection.findByIdAndUpdate(userId, {
      isIdVerified: true,
      idVerificationStatus: "verified",
      firstName: firstName,
      lastName: lastName,
    });
    await Notification.create({
      userId: userId,
      type: "id_verified",
      message:
        "Your ID has been verified. You can now post tasks and apply for jobs.",
      read: false,
    });
    req.flash("success", `${firstName} ${lastName} has been verified`);
    res.redirect("/admin/verifications");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    res.redirect("/admin/verifications");
  }
};
