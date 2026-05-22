const express = require("express");
const path = require("path");
const connection = require("./database/connect");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const taskRoutes = require("./routes/taskRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const InboxRoutes = require("./routes/inboxRoutes");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const expressValidator = require("express-validator");
const methodOverride = require("method-override");
require("./config/passport");
const i18n = require("i18n");
const MongoStore = require("connect-mongo").default;
const store = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
const publicPath = path.join(__dirname, "public");

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(publicPath, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store,
  }),
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
i18n.configure({
  locales: ["en", "fr"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  cookie: "lang",
});
app.use(i18n.init);
app.use(methodOverride("_method"));
app.use("/", authRoutes);
app.use("/profile", profileRoutes);
app.use("/tasks", taskRoutes);
app.use("/rating", ratingRoutes);
app.use("/application", applicationRoutes);
app.use("/admin", adminRoutes);
app.use("/inbox", InboxRoutes);

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const start = async () => {
  try {
    await connection();
    app.listen(PORT, () => console.log("Server is running on PORT", PORT));
  } catch (error) {
    console.log(error);
  }
};

start();
