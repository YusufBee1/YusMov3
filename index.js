const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public')); // Serves documentation.html from 'public' folder

// ========================
// ROUTES
// ========================

// Root welcome message
app.get('/', (req, res) => {
  res.send('Welcome to YusMov API! Visit /movies or /documentation.html to get started.');
});

// 1. Get all movies
app.get('/movies', (req, res) => {
  // Example movie list; replace with your real data when ready
  const topMovies = [
    { title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008 },
    { title: 'Inception', director: 'Christopher Nolan', year: 2010 },
    { title: 'Fight Club', director: 'David Fincher', year: 1999 },
    { title: 'The Social Network', director: 'David Fincher', year: 2010 },
    { title: 'Interstellar', director: 'Christopher Nolan', year: 2014 },
    { title: 'Pulp Fiction', director: 'Quentin Tarantino', year: 1994 },
    { title: 'Goodfellas', director: 'Martin Scorsese', year: 1990 },
    { title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
    { title: 'Se7en', director: 'David Fincher', year: 1995 },
    { title: 'Memento', director: 'Christopher Nolan', year: 2000 }
  ];
  res.json(topMovies);
});

// 2. Get a single movie by title
app.get('/movies/:title', (req, res) => {
  res.send(`Successful GET request: Returning data for movie with title "${req.params.title}".`);
});

// 3. Get genre by name
app.get('/genres/:name', (req, res) => {
  res.send(`Successful GET request: Returning description for genre "${req.params.name}".`);
});

// 4. Get director by name
app.get('/directors/:name', (req, res) => {
  res.send(`Successful GET request: Returning data for director "${req.params.name}".`);
});

// 5. Register a new user
app.post('/users', (req, res) => {
  res.send('Successful POST request: Registering a new user.');
});

// 6. Update a user’s username
app.put('/users/:username', (req, res) => {
  res.send(`Successful PUT request: Updating user "${req.params.username}".`);
});

// 7. Add a movie to user’s favorites
app.post('/users/:username/movies/:movieId', (req, res) => {
  res.send(`Successful POST request: Adding movie ${req.params.movieId} to ${req.params.username}'s favorites.`);
});

// 8. Remove a movie from user’s favorites
app.delete('/users/:username/movies/:movieId', (req, res) => {
  res.send(`Successful DELETE request: Removing movie ${req.params.movieId} from ${req.params.username}'s favorites.`);
});

// 9. Deregister an existing user
app.delete('/users/:username', (req, res) => {
  res.send(`Successful DELETE request: Deregistering user "${req.params.username}".`);
});

// ========================
// TEST ERROR ROUTE (optional)
// ========================
app.get('/error-test', (req, res, next) => {
  next(new Error('This is a test error!'));
});

// ========================
// ERROR-HANDLING MIDDLEWARE
// ========================
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(500).send('Something went wrong on the server!');
});

// ========================
// START SERVER
// ========================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
