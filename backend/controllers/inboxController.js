const Notification = require("../database/models/Notification");

exports.getInbox = async (req, res) => {
  try {
    const user = req.session.user || req.user;

    if (!user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }

    const notifications = await Notification.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    // Mark all as read when user views inbox
    await Notification.updateMany(
      { userId: user._id, read: false },
      { read: true },
    );

    res.render("inbox", {
      user: user,
      notifications: notifications,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const user = req.session.user || req.user;

    if (!user) {
      return res.json({ count: 0 });
    }

    const count = await Notification.countDocuments({
      userId: user._id,
      read: false,
    });

    res.json({ count: count });
  } catch (error) {
    console.log(error);
    res.json({ count: 0 });
  }
};

exports.getRecentNotifications = async (req, res) => {
  try {
    const user = req.session.user || req.user;

    if (!user) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5); // Only get 5 most recent

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.log(error);
    res.json({ notifications: [], unreadCount: 0 });
  }
};

exports.getAdminVerificationRequests = async (req, res) => {
  try {
    const user = req.session.user || req.user;

    if (!user || !user.isAdmin) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await Notification.find({
      userId: user._id,
      type: "new_id_request",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      type: "new_id_request",
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.log(error);
    res.json({ notifications: [], unreadCount: 0 });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const user = req.session.user || req.user;

    if (!user) {
      return res.json({ success: false });
    }

    await Notification.updateMany(
      { userId: user._id, read: false },
      { read: true },
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

exports.getAdminUnreadCount = async (req, res) => {
  try {
    const user = req.session.user || req.user;
    if (!user || !user.isAdmin) {
      return res.json({ count: 0 });
    }
    const count = await Notification.countDocuments({
      userId: user._id,
      type: "new_id_request",
      read: false,
    });
    res.json({ count: count });
  } catch (error) {
    console.log(error);
    res.json({ count: 0 });
  }
};
