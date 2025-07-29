const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public')); // Serves documentation.html

// Routes
app.get('/', (req, res) => {
  res.send('Your movie API is live. Add /movies to the URL to start playing.');
});

app.get('/movies', (req, res) => {
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

// ❌ Force error route (optional test)
app.get('/error-test', (req, res, next) => {
  next(new Error('This is a test error!'));
});

// Error-handling middleware (MUST be last)
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(500).send('Something went wrong on the server!');
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
