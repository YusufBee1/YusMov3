// index.js
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Movie, User } = require("./models");

const app = express();
const port = process.env.PORT || 8080;

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
app.use(express.static("public")); // Serves documentation.html

// ========================
// ROUTES
// ========================

// Root welcome message
app.get("/", (req, res) => {
  res.send("Welcome to YusMov API! Visit /movies or /documentation.html to get started.");
});

// 1. Get all movies
app.get("/movies", async (req, res, next) => {
  try {
    const movies = await Movie.find().lean();
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

// 2. Get a single movie by title
app.get("/movies/:title", async (req, res, next) => {
  try {
    const title = req.params.title;
    const movie = await Movie.findOne({ title: new RegExp(`^${title}$`, "i") }).lean();
    if (!movie) return res.status(404).send("Movie not found");
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

// 3. Get genre by name
app.get("/genres/:name", async (req, res, next) => {
  try {
    const name = req.params.name;
    // Find any movie with that genre, then return the genre subdocument
    const movie = await Movie.findOne({ "genre.name": new RegExp(`^${name}$`, "i") }, "genre").lean();
    if (!movie) return res.status(404).send("Genre not found");
    res.json(movie.genre);
  } catch (err) {
    next(err);
  }
});

// 4. Get director by name
app.get("/directors/:name", async (req, res, next) => {
  try {
    const name = req.params.name;
    const movie = await Movie.findOne({ "director.name": new RegExp(`^${name}$`, "i") }, "director").lean();
    if (!movie) return res.status(404).send("Director not found");
    res.json(movie.director);
  } catch (err) {
    next(err);
  }
});

// 5. Register a new user
app.post("/users", async (req, res, next) => {
  try {
    const { username, email, password, birthday } = req.body;
    if (!username || !email || !password) {
      return res.status(400).send("Username, email, and password are required");
    }
    const user = await User.create({ username, email, password, birthday });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// 6. Update a user's username
app.put("/users/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    const { newUsername } = req.body;
    if (!newUsername) {
      return res.status(400).send("New username is required");
    }
    const updated = await User.findOneAndUpdate(
      { username },
      { $set: { username: newUsername } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).send("User not found");
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 7. Add a movie to user's favorites
app.post("/users/:username/movies/:movieId", async (req, res, next) => {
  try {
    const { username, movieId } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");
    if (!user.favorites.includes(movieId)) {
      user.favorites.push(movieId);
      await user.save();
    }
    res.send(`Movie ${movieId} added to ${username}'s favorites`);
  } catch (err) {
    next(err);
  }
});

// 8. Remove a movie from user's favorites
app.delete("/users/:username/movies/:movieId", async (req, res, next) => {
  try {
    const { username, movieId } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");
    user.favorites.pull(movieId);
    await user.save();
    res.send(`Movie ${movieId} removed from ${username}'s favorites`);
  } catch (err) {
    next(err);
  }
});

// 9. Deregister an existing user
app.delete("/users/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await User.deleteOne({ username });
    if (result.deletedCount === 0) return res.status(404).send("User not found");
    res.send(`User ${username} deregistered`);
  } catch (err) {
    next(err);
  }
});

// ========================
// ERROR-HANDLING MIDDLEWARE
// ========================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).send("Something went wrong on the server!");
});

// ========================
// START SERVER
// ========================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

