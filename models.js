// models.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  email:    { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // will be hashed
  birthday: { type: Date, default: null },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
}, { timestamps: true });

/** STATIC: hash a plain password */
UserSchema.statics.hashPassword = async function (plain) {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
};

/** METHOD: compare a plain password to the stored hash */
UserSchema.methods.validatePassword = async function (plain) {
  // if somehow no hash is stored (old seed data), treat as not valid
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

/**
 * PRE-SAVE: if password was created/changed on a save(), hash it.
 * NOTE: This DOES NOT run for findOneAndUpdate, so we handle that in index.js.
 */
UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Create models
const Movie = mongoose.model('Movie', MovieSchema);
const User  = mongoose.model('User', UserSchema);

// Export models
module.exports = { Movie, User };
