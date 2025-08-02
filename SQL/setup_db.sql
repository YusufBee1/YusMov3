-- Create database
CREATE DATABASE movie_api;

\c movie_api; -- Connect to database (PostgreSQL)

-- ==========================
-- TABLES
-- ==========================

CREATE TABLE Directors (
  director_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bio TEXT,
  birth_year INT,
  death_year INT
);

CREATE TABLE Genres (
  genre_id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE Movies (
  movie_id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  genre_id INT REFERENCES Genres(genre_id) ON DELETE SET NULL,
  director_id INT REFERENCES Directors(director_id) ON DELETE SET NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  birthday DATE
);

CREATE TABLE UsersMovies (
  user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
  movie_id INT REFERENCES Movies(movie_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, movie_id)
);

-- ==========================
-- SAMPLE DATA
-- ==========================

-- Insert Genres
INSERT INTO Genres (name, description) VALUES
('Action', 'High-energy films with lots of stunts and battles'),
('Thriller', 'Suspenseful and exciting films'),
('Drama', 'Serious, character-driven stories');

-- Insert Directors
INSERT INTO Directors (name, bio, birth_year) VALUES
('Christopher Nolan', 'British-American filmmaker known for complex storytelling.', 1970),
('David Fincher', 'American director known for psychological thrillers.', 1962),
('Quentin Tarantino', 'American filmmaker with a unique style of dialogue and violence.', 1963);

-- Insert Movies (10 movies)
INSERT INTO Movies (title, description, genre_id, director_id, image_url, featured) VALUES
('Inception', 'A mind-bending thriller about dreams within dreams.', 2, 1, 'https://image.url/inception.jpg', TRUE),
('The Dark Knight', 'Batman faces the Joker in Gotham City.', 1, 1, 'https://image.url/darkknight.jpg', TRUE),
('Memento', 'A man with short-term memory loss seeks revenge.', 2, 1, 'https://image.url/memento.jpg', FALSE),
('Interstellar', 'A team travels through a wormhole to save humanity.', 1, 1, 'https://image.url/interstellar.jpg', TRUE),
('Fight Club', 'An insomniac forms an underground fight club.', 2, 2, 'https://image.url/fightclub.jpg', FALSE),
('Se7en', 'Two detectives hunt a serial killer.', 2, 2, 'https://image.url/se7en.jpg', TRUE),
('The Social Network', 'The story of Facebook’s creation.', 3, 2, 'https://image.url/socialnetwork.jpg', FALSE),
('Pulp Fiction', 'Interconnected stories of crime in Los Angeles.', 1, 3, 'https://image.url/pulpfiction.jpg', TRUE),
('Kill Bill', 'A bride seeks revenge on her former assassin team.', 1, 3, 'https://image.url/killbill.jpg', FALSE),
('Django Unchained', 'A freed slave teams up with a bounty hunter.', 1, 3, 'https://image.url/django.jpg', TRUE);

-- Insert Users
INSERT INTO Users (username, email, password, birthday) VALUES
('alice', 'alice@example.com', 'hashed_pw1', '1990-05-12'),
('bob', 'bob@example.com', 'hashed_pw2', '1985-09-23'),
('charlie', 'charlie@example.com', 'hashed_pw3', '2000-01-15');

-- Insert UsersMovies (Favorites)
INSERT INTO UsersMovies (user_id, movie_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 5),
(3, 1),
(3, 6);
