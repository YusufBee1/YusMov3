// passport.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Strategy: JWTStrategy, ExtractJwt } = require("passport-jwt");
const { User } = require("./models");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

/**
 * LOCAL STRATEGY (username + password).
 * Uses user.validatePassword (bcrypt compare) from models.js.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username }).exec();
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const ok = await user.validatePassword(password);
        if (!ok) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/**
 * JWT STRATEGY (Bearer token in Authorization header)
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
      algorithms: ["HS256"],
      ignoreExpiration: false,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub).exec();
        if (!user) return done(null, false, { message: "User not found" });
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// (Sessions not used, but harmless to define)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
