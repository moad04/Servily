const adminAuth = (req, res, next) => {
  const user = req.session.user || req.user;
  if (!user || !user.isAdmin) {
    req.flash("error", "ACCESS DENIED!");
    return res.redirect("/");
  }
  next();
};

module.exports = adminAuth;
