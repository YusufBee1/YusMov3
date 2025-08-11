// passport.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Strategy: JWTStrategy, ExtractJwt } = require("passport-jwt");
const { User } = require("./models");

// Use the same secret as index.js/auth.js
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

/**
 * LOCAL STRATEGY
 * Authenticates with username + password sent in the request body (or from basicAuthToBody in auth.js).
 * NOTE: This compares plaintext passwords because that’s how your seed data is stored right now.
 * When you add hashing, replace the comparison with bcrypt.compare.
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
        // Plaintext compare (replace with bcrypt.compare when you add hashing)
        if (user.password !== password) {
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
 * JWT STRATEGY
 * Validates a Bearer token (Authorization: Bearer <token>).
 * Expects token payload with { sub: <userId>, username: <string> } as issued in auth.js.
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
        // payload.sub is the user _id (string) we signed in auth.js
        const user = await User.findById(payload.sub).exec();
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// We are not using sessions, but Passport requires these if sessions were enabled.
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
