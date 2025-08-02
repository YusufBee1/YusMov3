// models.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Embedded schema for Genre
const GenreSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' }
}, { _id: false });

// Embedded schema for Director
const DirectorSchema = new Schema({
  name: { type: String, required: true, trim: true },
  bio: { type: String, default: '' },
  birthYear: { type: Number },
  deathYear: { type: Number, default: null }
}, { _id: false });

// Movie schema
const MovieSchema = new Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  genre: GenreSchema,
  director: DirectorSchema,
  imageUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  runtimeMinutes: { type: Number, default: null },
  rating: { type: String, default: '' },
  cast: [{ type: String }]
}, { timestamps: true });

// User schema
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  birthday: { type: Date, default: null },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
}, { timestamps: true });

// Create models
const Movie = mongoose.model('Movie', MovieSchema);
const User = mongoose.model('User', UserSchema);

// Export models
module.exports = { Movie, User };