const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OMDB_KEY = '1f4358c';

mongoose.connect('mongodb://localhost:27017/movieapp')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const favouriteSchema = new mongoose.Schema({
  imdbID: String,
  Title: String,
  Year: String,
  Poster: String,
});
const Favourite = mongoose.model('Favourite', favouriteSchema);

app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  const response = await axios.get(`http://www.omdbapi.com/?s=${query}&apikey=${OMDB_KEY}`);
  res.json(response.data.Search || []);
});

app.get('/api/favourites', async (req, res) => {
  const favs = await Favourite.find();
  res.json(favs);
});

app.post('/api/favourites', async (req, res) => {
  const existing = await Favourite.findOne({ imdbID: req.body.imdbID });
  if (existing) return res.json({ message: 'Already in favourites' });
  const fav = new Favourite(req.body);
  await fav.save();
  res.json(fav);
});

app.delete('/api/favourites/:id', async (req, res) => {
  await Favourite.findByIdAndDelete(req.params.id);
  res.json({ message: 'Removed' });
});

app.listen(5000, () => console.log('Server running on port 5000'));