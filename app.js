const express = require("express");
const path = require("path");
const connection = require("./database/connect");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

require("./config/passport");

const app = express();
const PORT = process.env.PORT;
app.use(flash());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/", authRoutes);

const start = async () => {
  try {
    await connection();
    app.listen(PORT, () => console.log("Server is running on PORT", PORT));
  } catch (error) {
    console.log(error);
  }
};

start();
