// index.js
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const passport = require("passport");          // ✅ use passport library
require("./passport");                         // ✅ register strategies
const { Movie, User } = require("./models");

const app = express();
const port = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// ========================
// MONGOOSE CONNECTION
// ========================
const MONGO_URI = "mongodb://localhost:27017/yusmov";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ========================
// MIDDLEWARE
// ========================
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());               // initialize passport
app.use(express.static("public"));            // serve docs and index.html

// ⬇️ load /login from auth.js (single source of truth)
const authRoutes = require("./auth");
authRoutes(app);

// ========================
// PUBLIC ROUTES
// ========================

// Root welcome message
app.get("/", (req, res) => {
  res.send(
    "Welcome to YusMov API! Visit /movies or /documentation.html to get started."
  );
});

// User registration (public)
app.post("/users", async (req, res, next) => {
  try {
    const { username, email, password, birthday } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .send("Username, email, and password are required");
    }
    const user = await User.create({ username, email, password, birthday });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// (Removed duplicate inline /login — handled by auth.js)

// ========================
// PROTECTED ROUTES
// ========================
const auth = passport.authenticate("jwt", { session: false });

// 1. Get all movies
app.get("/movies", auth, async (req, res, next) => {
  try {
    const movies = await Movie.find().lean();
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

// 2. Get a single movie by title
app.get("/movies/:title", auth, async (req, res, next) => {
  try {
    const movie = await Movie.findOne({
      title: new RegExp(`^${req.params.title}$`, "i"),
    }).lean();
    if (!movie) return res.status(404).send("Movie not found");
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

// 3. Get genre by name
app.get("/genres/:name", auth, async (req, res, next) => {
  try {
    const found = await Movie.findOne(
      { "genre.name": new RegExp(`^${req.params.name}$`, "i") },
      "genre"
    ).lean();
    if (!found) return res.status(404).send("Genre not found");
    res.json(found.genre);
  } catch (err) {
    next(err);
  }
});

// 4. Get director by name
app.get("/directors/:name", auth, async (req, res, next) => {
  try {
    const found = await Movie.findOne(
      { "director.name": new RegExp(`^${req.params.name}$`, "i") },
      "director"
    ).lean();
    if (!found) return res.status(404).send("Director not found");
    res.json(found.director);
  } catch (err) {
    next(err);
  }
});

// 5. Update a user's info
app.put("/users/:username", auth, async (req, res, next) => {
  try {
    const updates = {};
    ["username", "email", "password", "birthday"].forEach((f) => {
      const key = `new${f.charAt(0).toUpperCase() + f.slice(1)}`;
      if (req.body[key]) updates[f] = req.body[key];
    });
    if (Object.keys(updates).length === 0) {
      return res.status(400).send("No valid update fields provided");
    }
    const updated = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).send("User not found");
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 6. Add a movie to user's favorites (🔒 hardened)
app.post("/users/:username/movies/:movieId", auth, async (req, res, next) => {
  try {
    const { username, movieId } = req.params;
    // Validate movieId format
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send("Invalid movieId");
    }
    // Ensure movie exists
    const movie = await Movie.findById(movieId).lean();
    if (!movie) return res.status(404).send("Movie not found");

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");

    const already = user.favorites.some((id) => id.toString() === movieId);
    if (!already) {
      user.favorites.push(movieId);
      await user.save();
    }
    res.send(`Movie ${movieId} added to ${username}'s favorites`);
  } catch (err) {
    next(err);
  }
});

// 7. Remove a movie from user's favorites (🔒 hardened)
app.delete("/users/:username/movies/:movieId", auth, async (req, res, next) => {
  try {
    const { username, movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send("Invalid movieId");
    }
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");

    user.favorites = user.favorites.filter((id) => id.toString() !== movieId);
    await user.save();
    res.send(`Movie ${movieId} removed from ${username}'s favorites`);
  } catch (err) {
    next(err);
  }
});

// 8. Deregister an existing user
app.delete("/users/:username", auth, async (req, res, next) => {
  try {
    const result = await User.deleteOne({ username: req.params.username });
    if (result.deletedCount === 0) return res.status(404).send("User not found");
    res.send(`User ${req.params.username} deregistered`);
  } catch (err) {
    next(err);
  }
});

// ========================
// ERROR-HANDLING MIDDLEWARE
// ========================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).send("Something went wrong on the server!");
});

// ========================
// START SERVER
// ========================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
