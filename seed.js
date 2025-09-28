// seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const { Movie } = require("./models");

// Use Atlas connection string from .env or Heroku
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

const movies = [
  {
    Title: "The Crow",
    Description: "A man brutally murdered comes back to life as an undead avenger of his fiancée's death.",
    ImageURL: "https://m.media-amazon.com/images/I/81YFfHuh-PL._AC_SY679_.jpg",
    Genre: { Name: "Gothic Superhero", Description: "Dark, tragic, and gothic revenge themes." },
    Director: { Name: "Alex Proyas" }
  },
  {
    Title: "Beetlejuice",
    Description: "A recently deceased couple hire a sleazy ghost to help haunt their former home.",
    ImageURL: "https://m.media-amazon.com/images/I/71R1K9Uu1oL._AC_SY679_.jpg",
    Genre: { Name: "Dark Comedy", Description: "Gothic humor with Tim Burton flair." },
    Director: { Name: "Tim Burton" }
  },
  {
    Title: "Interview with the Vampire",
    Description: "A journalist interviews a vampire who tells the story of his immortal life.",
    ImageURL: "https://m.media-amazon.com/images/I/71t4GZ9J+fL._AC_SY679_.jpg",
    Genre: { Name: "Horror", Description: "Romantic, gothic vampire storytelling." },
    Director: { Name: "Neil Jordan" }
  },
  {
    Title: "Edward Scissorhands",
    Description: "An artificial man with scissors for hands lives in isolation until love draws him out.",
    ImageURL: "https://m.media-amazon.com/images/I/71DjSl4Xn6L._AC_SY679_.jpg",
    Genre: { Name: "Romantic Fantasy", Description: "Tragic and gothic suburban fairytale." },
    Director: { Name: "Tim Burton" }
  },
  {
    Title: "Nosferatu",
    Description: "The classic 1922 silent film about Count Orlok, a vampire who preys on the living.",
    ImageURL: "https://m.media-amazon.com/images/I/71+E0e0JbrL._AC_SY679_.jpg",
    Genre: { Name: "Horror", Description: "Silent-era gothic horror." },
    Director: { Name: "F.W. Murnau" }
  },
  {
    Title: "Dracula (1931)",
    Description: "Bela Lugosi stars in this iconic portrayal of Count Dracula.",
    ImageURL: "https://m.media-amazon.com/images/I/71h7V8c5oDL._AC_SY679_.jpg",
    Genre: { Name: "Horror", Description: "Classic Universal gothic horror." },
    Director: { Name: "Tod Browning" }
  },
  {
    Title: "Crimson Peak",
    Description: "A young woman marries into a mysterious family and discovers terrifying secrets.",
    ImageURL: "https://m.media-amazon.com/images/I/81i5Fdbzj1L._AC_SY679_.jpg",
    Genre: { Name: "Gothic Romance", Description: "Haunted house gothic by Guillermo del Toro." },
    Director: { Name: "Guillermo del Toro" }
  },
  {
    Title: "Sleepy Hollow",
    Description: "Ichabod Crane investigates murders linked to the Headless Horseman.",
    ImageURL: "https://m.media-amazon.com/images/I/81FxHj6fHYL._AC_SY679_.jpg",
    Genre: { Name: "Horror Mystery", Description: "Tim Burton’s gothic reimagining of the classic tale." },
    Director: { Name: "Tim Burton" }
  },
  {
    Title: "The Addams Family",
    Description: "The quirky, macabre Addams family faces off against a con artist.",
    ImageURL: "https://m.media-amazon.com/images/I/71EwQ6tFb0L._AC_SY679_.jpg",
    Genre: { Name: "Dark Comedy", Description: "Gothic humor with iconic characters." },
    Director: { Name: "Barry Sonnenfeld" }
  },
  {
    Title: "Only Lovers Left Alive",
    Description: "Two sophisticated vampires reunite in Detroit, exploring love and ennui.",
    ImageURL: "https://m.media-amazon.com/images/I/81gY8dPSNML._AC_SY679_.jpg",
    Genre: { Name: "Romantic Horror", Description: "Indie gothic exploration of immortality." },
    Director: { Name: "Jim Jarmusch" }
  }
];

async function seedMovies() {
  try {
    await Movie.deleteMany({});
    await Movie.insertMany(movies);
    console.log("🎉 Database seeded with goth movies!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding DB:", err.message);
    mongoose.disconnect();
  }
}

seedMovies();
