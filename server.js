// server.js
// Simple Express server that serves static frontend and provides a /weather API endpoint.
// Loads API key from .env using dotenv.

require('dotenv').config();             // Reads .env and puts values into process.env
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic check: ensure API key is present
const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  console.error('ERROR: OPENWEATHER_API_KEY not found. Add it to a .env file.');
  process.exit(1);
}

// Serve static files from the "public" folder (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// /weather?city=London
// This endpoint accepts a "city" query param, calls OpenWeatherMap, and returns simplified JSON.
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'Missing required query parameter: city' });
  }

  try {
    // Build OpenWeatherMap API request
    // Using "units=metric" to return Celsius. Change to "imperial" for Fahrenheit.
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const resp = await axios.get(url, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      },
      timeout: 5000
    });

    const data = resp.data;

    // Pick only the fields we need and return a clean JSON to the frontend
    const result = {
      city: data.name,
      country: data.sys?.country,
      coordinates: data.coord,
      weather: {
        main: data.weather?.[0]?.main,
        description: data.weather?.[0]?.description,
        icon: data.weather?.[0]?.icon   // icon code e.g. "10d"
      },
      temp: {
        current: data.main?.temp,
        feels_like: data.main?.feels_like,
        min: data.main?.temp_min,
        max: data.main?.temp_max,
        humidity: data.main?.humidity
      },
      wind: {
        speed: data.wind?.speed,
        deg: data.wind?.deg
      }
    };

    res.json(result);
  } catch (err) {
    // If OpenWeather returns a 404 for unknown city, relay a friendly message
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: 'City not found. Try another name.' });
    }
    // Other errors
    console.error('Weather fetch error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch weather. Try again later.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
