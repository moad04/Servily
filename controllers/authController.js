const { userCollection } = require("../database/models/User");
const bcrypt = require("bcrypt");
const Client = require("../database/models/Client");
const Worker = require("../database/models/Worker");

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      req.flash("error", "Fields must not be empty");
      res.redirect("/signup");
    }
    const existingUser = await userCollection.findOne({
      email: email,
    });
    if (existingUser) {
      req.flash("error", "User already exists please sign in");
      res.redirect("/login");
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      if (role === "client") {
        const newClient = await Client.create({
          lastName,
          firstName,
          email,
          password: hashedPassword,
          role,
        });
      } else if (role === "worker") {
        const newWorker = await Worker.create({
          lastName,
          firstName,
          email,
          password: hashedPassword,
          role,
        });
      }
      res.redirect("/login");
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
      res.redirect("/signup");
    }

    if (!user.password) {
      req.flash(
        "error",
        "User was signed up using Google please log in using Google",
      );
      res.redirect("/login");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      req.flash("error", "Password doesnt match");
      res.redirect("/login");
    }

    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
