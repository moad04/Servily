const { userCollection } = require("../database/models/User");
const bcrypt = require("bcrypt");
const Client = require("../database/models/Client");
const Worker = require("../database/models/Worker");
const {
  generateVerificationCode,
  sendVerificationMail,
} = require("../config/emailService");

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      req.flash("error", "Fields must not be empty");
      return res.redirect("/signup");
    }
    if (firstName.length < 4 || lastName.length < 4) {
      req.flash("error", "Please enter a valid name ");
      return res.redirect("/signup");
    }
    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters");
      return res.redirect("/signup");
    }
    const existingUser = await userCollection.findOne({
      email: email,
    });
    if (existingUser) {
      req.flash("error", "User already exists please sign in");
      return res.redirect("/login");
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const verificationCode = generateVerificationCode();
      const generateExpires = new Date(Date.now() + 15 * 60 * 1000);
      if (role === "client") {
        const newClient = await Client.create({
          lastName,
          firstName,
          email,
          password: hashedPassword,
          role,
          isEmailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationExpires: generateExpires,
        });
        req.session.pendingUserId = newClient._id;
      } else if (role === "worker") {
        const newWorker = await Worker.create({
          lastName,
          firstName,
          email,
          password: hashedPassword,
          role,
          isEmailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationExpires: generateExpires,
        });
        req.session.pendingUserId = newWorker._id;
      }

      await sendVerificationMail(email, firstName, verificationCode);
      req.flash("success", "Your account was created please verify your email");
      req.flash("email", email);
      return res.redirect("/verify-email");
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await userCollection.findOne({ email });

    if (!user) {
      req.flash("error", "User doesnt exist please sign up ");
      return res.redirect("/signup");
    }

    if (!user.password) {
      req.flash(
        "error",
        "User was signed up using Google please log in using Google",
      );
      return res.redirect("/login");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      req.flash("error", "Password doesnt match");
      return res.redirect("/login");
    }
    if (!user.isEmailVerified) {
      req.flash("error", "Please verify your email!");
      return res.redirect("/verify-email");
    }
    req.session.user = user;
    res.render("redirect", { user: req.session.user || req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.showVerifyPage = async (req, res) => {
  try {
    const userId = req.session.pendingUserId;
    if (!userId) {
      req.flash("error", "Please sign up first!");
      return res.redirect("/signup");
    }
    return res.render("verify-email", { messages: req.flash() });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect("/signup");
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const userId = req.session.pendingUserId;
    const { code } = req.body;
    if (!userId) {
      req.flash("error", "Please sign up first!");
      return res.redirect("/signup");
    }
    const user = await userCollection.findById(userId);
    if (!user) {
      req.flash("error", "User was not found");
      return res.redirect("/signup");
    }
    if (user.isEmailVerified) {
      req.flash("success", "Email already verified");
      return res.redirect("/login");
    }
    if (user.emailVerificationCode !== code) {
      req.flash("error", "Code doesn't match!");
      return res.redirect("/verify-email");
    }
    if (user.emailVerificationExpires < new Date()) {
      req.flash("error", "Code expired. Please request a new one.");
      return res.redirect("/resend-verification");
    }
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();
    req.session.pendingUserId = null;

    req.flash("success", "Email verified! You can now login.");
    return res.redirect("/login");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect("/verify-email");
  }
};
exports.resesndVerification = async (req, res) => {
  try {
    const userId = req.session.pendingUserId;
    if (!userId) {
      req.flash("error", "Please sign up first");
      return res.redirect("/signup");
    }
    const user = await userCollection.findById(userId);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/signup");
    }
    if (user.isEmailVerified) {
      req.flash("success", "Email already verified");
      return res.redirect("/login");
    }
    const {
      generateVerificationCode,
      sendVerificationMail,
    } = require("../config/emailService");
    const newCode = generateVerificationCode();
    const newExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.emailVerificationCode = newCode;
    user.emailVerificationExpires = newExpires;
    await user.save();
    await sendVerificationMail(user.email, user.firstName, newCode);

    req.flash("success", "New verification code sent to your email");
    return res.redirect("/verify-email");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect("/verify-email");
  }
};
