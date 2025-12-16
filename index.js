// index.js

// ========================
// ENV & CONFIG
// ========================
require('dotenv').config(); // Load .env when running locally

// ✅ Match your .env key (CONNECTION_URI)
const MONGO_URI = process.env.CONNECTION_URI || 'mongodb://localhost:27017/yusmov';
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// ========================
// DEPENDENCIES
// ========================
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

require('./passport'); // Register Passport strategies
const { Movie, User } = require('./models');

const app = express();

// ========================
// MONGOOSE CONNECTION
// ========================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ========================
// MIDDLEWARE
// ========================
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.options('*', cors());
app.use(passport.initialize());
app.use(express.static('public'));

// Load /login from auth.js
const authRoutes = require('./auth');
authRoutes(app);

// ========================
// VALIDATION HELPERS
// ========================
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
}

const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must include a number'),
  body('birthday')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Birthday must be an ISO date (YYYY-MM-DD)')
    .toDate(),
];

const updateValidation = [
  body('newUsername').optional().trim().isLength({ min: 3 }).withMessage('newUsername must be at least 3 characters'),
  body('newEmail').optional().isEmail().withMessage('newEmail must be a valid email').normalizeEmail(),
  body('newPassword')
    .optional()
    .isLength({ min: 8 }).withMessage('newPassword must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('newPassword must include an uppercase letter')
    .matches(/[a-z]/).withMessage('newPassword must include a lowercase letter')
    .matches(/[0-9]/).withMessage('newPassword must include a number'),
  body('newBirthday')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('newBirthday must be an ISO date (YYYY-MM-DD)')
    .toDate(),
];

// ========================
// ROUTE GUARD
// ========================
const auth = passport.authenticate('jwt', { session: false });

// ========================
// PUBLIC ROUTES
// ========================

/**
 * @description Welcome endpoint
 * @method GET
 * @param {string} endpoint - /
 * @returns {string} Welcome message
 */
app.get('/', (req, res) => {
  res.send('Welcome to YusMov API! Visit /documentation.html to get started.');
});

/**
 * @description Register a new user
 * @method POST
 * @param {string} endpoint - /users
 * @param {string} username - Required, min 3 chars
 * @param {string} password - Required, min 8 chars
 * @param {string} email - Required, valid email
 * @param {Date} birthday - Optional, ISO date
 * @returns {Object} The created user object
 */
app.post('/users', registerValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { username, email, password, birthday } = req.body;
    if (!username || !email || !password) {
      return res.status(400).send('Username, email, and password are required');
    }
    const user = new User({ username, email, password, birthday });
    await user.save();
    const safe = {
      _id: user._id,
      username: user.username,
      email: user.email,
      birthday: user.birthday,
      favorites: user.favorites,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

// ========================
// PROTECTED ROUTES
// ========================

/**
 * @description Get all movies
 * @method GET
 * @param {string} endpoint - /movies
 * @returns {Object[]} Array of all movie objects
 * @requires authentication JWT
 */
app.get('/movies', auth, async (req, res, next) => {
  try {
    const movies = await Movie.find().lean();
    res.status(200).json(movies);
  } catch (err) {
    next(err);
  }
});

/**
 * @description Get a movie by title
 * @method GET
 * @param {string} endpoint - /movies/:title
 * @param {string} title - The title of the movie
 * @returns {Object} A single movie object
 * @requires authentication JWT
 */
app.get('/movies/:title', auth, async (req, res, next) => {
  try {
    const movie = await Movie.findOne({
      title: new RegExp(`^${req.params.title}$`, 'i'),
    }).lean();
    if (!movie) return res.status(404).send('Movie not found');
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

/**
 * @description Return data about a genre
 * @method GET
 * @param {string} endpoint - /genres/:name
 * @param {string} name - The name of the genre
 * @returns {Object} Genre object with name and description
 * @requires authentication JWT
 */
app.get('/genres/:name', auth, async (req, res, next) => {
  try {
    const found = await Movie.findOne(
      { 'genre.name': new RegExp(`^${req.params.name}$`, 'i') },
      'genre'
    ).lean();
    if (!found) return res.status(404).send('Genre not found');
    res.json(found.genre);
  } catch (err) {
    next(err);
  }
});

/**
 * @description Return data about a director
 * @method GET
 * @param {string} endpoint - /directors/:name
 * @param {string} name - The name of the director
 * @returns {Object} Director object with name, bio, birth, death
 * @requires authentication JWT
 */
app.get('/directors/:name', auth, async (req, res, next) => {
  try {
    const found = await Movie.findOne(
      { 'director.name': new RegExp(`^${req.params.name}$`, 'i') },
      'director'
    ).lean();
    if (!found) return res.status(404).send('Director not found');
    res.json(found.director);
  } catch (err) {
    next(err);
  }
});

/**
 * @description Update a user's info
 * @method PUT
 * @param {string} endpoint - /users/:username
 * @param {string} username - Required path parameter
 * @param {string} newUsername - Optional
 * @param {string} newPassword - Optional
 * @param {string} newEmail - Optional
 * @param {Date} newBirthday - Optional
 * @returns {Object} Updated user object
 * @requires authentication JWT
 */
app.put('/users/:username', auth, updateValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const updates = {};
    ['username', 'email', 'birthday'].forEach((f) => {
      const key = `new${f.charAt(0).toUpperCase() + f.slice(1)}`;
      if (req.body[key]) updates[f] = req.body[key];
    });

    if (req.body.newPassword) {
      updates.password = await User.hashPassword(req.body.newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).send('No valid update fields provided');
    }

    const updated = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).send('User not found');

    delete updated.password;
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @description Add a movie to user's favorites
 * @method POST
 * @param {string} endpoint - /users/:username/movies/:movieId
 * @param {string} username - User's username
 * @param {string} movieId - ID of the movie to add
 * @returns {string} Success message
 * @requires authentication JWT
 */
app.post('/users/:username/movies/:movieId', auth, async (req, res, next) => {
  try {
    const { username, movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send('Invalid movieId');
    }
    const movie = await Movie.findById(movieId).lean();
    if (!movie) return res.status(404).send('Movie not found');

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');

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

/**
 * @description Remove a movie from user's favorites
 * @method DELETE
 * @param {string} endpoint - /users/:username/movies/:movieId
 * @param {string} username - User's username
 * @param {string} movieId - ID of the movie to remove
 * @returns {string} Success message
 * @requires authentication JWT
 */
app.delete('/users/:username/movies/:movieId', auth, async (req, res, next) => {
  try {
    const { username, movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send('Invalid movieId');
    }
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');

    user.favorites = user.favorites.filter((id) => id.toString() !== movieId);
    await user.save();
    res.send(`Movie ${movieId} removed from ${username}'s favorites`);
  } catch (err) {
    next(err);
  }
});

/**
 * @description Delete a user
 * @method DELETE
 * @param {string} endpoint - /users/:username
 * @param {string} username - Username of the user to delete
 * @returns {string} Success message
 * @requires authentication JWT
 */
app.delete('/users/:username', auth, async (req, res, next) => {
  try {
    const result = await User.deleteOne({ username: req.params.username });
    if (result.deletedCount === 0) return res.status(404).send('User not found');
    res.send(`User ${req.params.username} deregistered`);
  } catch (err) {
    next(err);
  }
});

// ========================
// ERROR-HANDLING MIDDLEWARE
// ========================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).send('Something went wrong on the server!');
});

// ========================
// START SERVER
// ========================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Listening on Port ${PORT}`);
});