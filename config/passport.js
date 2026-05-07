const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { userCollection } = require("../database/models/User");
const Client = require("../database/models/Client");
const Worker = require("../database/models/Worker");
const flash = require("connect-flash");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
      failureFlash: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let state = req.query.state;
        let action = null;
        let role = null;
        if (state === "login") {
          action = "login";
        } else if (state && state.startsWith("signup")) {
          action = "signup";
          role = state.split(":")[1];
        }

        const existingUser = await userCollection.findOne({
          googleId: profile.id,
        });
        if (action === "login") {
          if (!existingUser) {
            return done(null, false, {
              message: "No account found please sign up ",
            });
          }
          return done(null, existingUser);
        }
        if (action === "signup") {
          if (existingUser) {
            return done(null, false, {
              message: "Account already exists please Login",
            });
          }
          if (!role) {
            return done(null, false, { message: "Please select a role" });
          }
          if (role === "client") {
            const newClient = await Client.create({
              googleId: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
              role: role,
            });
            return done(null, newClient);
          }
          if (role === "worker") {
            const newWorker = await Worker.create({
              googleId: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
              role: role,
            });
            return done(null, newWorker);
          }
        }
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user =
      (await userCollection.findById(id)) ||
      (await Client.findById(id)) ||
      (await Worker.findById(id));
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
});

module.exports = passport;
