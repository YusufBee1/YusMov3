// auth.js
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("./passport"); // ensure LocalStrategy & JWTStrategy are registered

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

/**
 * Optional middleware:
 * If credentials are sent via HTTP Basic (Authorization: Basic base64(username:password)),
 * decode them and place into req.body so LocalStrategy can read them.
 */
function basicAuthToBody(req, _res, next) {
  const header = req.headers["authorization"];
  if (header && header.startsWith("Basic ")) {
    try {
      const base64 = header.replace("Basic ", "");
      const decoded = Buffer.from(base64, "base64").toString("utf8");
      const idx = decoded.indexOf(":");
      if (idx !== -1) {
        req.body.username = decoded.slice(0, idx);
        req.body.password = decoded.slice(idx + 1);
      }
    } catch (_) {
      // ignore malformed basic auth; LocalStrategy will fail gracefully
    }
  }
  return next();
}

/**
 * Generate a JWT for the authenticated user.
 * - subject (sub) must match what your JWTStrategy expects (user._id)
 * - keep payload minimal; add claims as needed
 */
function generateJWT(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

/**
 * Attach the /login route to your app.
 * Usage in index.js:
 *   require('./auth')(app);
 */
module.exports = (app) => {
  app.post(
    "/login",
    basicAuthToBody, // allow either Basic header OR JSON body { username, password }
    (req, res, next) => {
      passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) return res.status(500).json({ message: "Auth error", error: err.message });
        if (!user) {
          return res
            .status(400)
            .json({ message: info?.message || "Invalid username or password" });
        }

        // finalize login (no session)
        req.login(user, { session: false }, (loginErr) => {
          if (loginErr) {
            return res.status(500).json({ message: "Login failed", error: loginErr.message });
          }
          const token = generateJWT(user);

          // send a safe user object (omit password)
          const safeUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            birthday: user.birthday,
            favorites: user.favorites,
          };

          return res.json({ user: safeUser, token });
        });
      })(req, res, next);
    }
  );
};
