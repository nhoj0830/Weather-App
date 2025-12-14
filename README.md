# Weather-App
A weather application that retrieves real-time weather data from a public API and displays it in the browser.
Repository: nhoj0830/weather-app
Files analyzed: 7

Estimated tokens: 2.8k

Directory structure:
└── nhoj0830-weather-app/
    ├── README.md
    ├── notes.md
    ├── package.json
    ├── server.js
    └── public/
        ├── index.html
        ├── script.js
        └── style.css


================================================
FILE: README.md
================================================
# Weather-App
A weather application that retrieves real-time weather data from a public API and displays it in the browser.



================================================
FILE: notes.md
================================================
The command:

```
npm install express axios cors
```

does **three things**: it installs **Express**, **Axios**, and **CORS** into your Node.js project, and adds them to your `package.json` dependencies.

Here’s what each one is and why you would use it:

---

# ✅ **1. Express**

### **What it is:**

A fast, minimal web framework for Node.js.

### **Purpose:**

* Create web servers and APIs
* Handle HTTP requests (GET, POST, PUT, DELETE, etc.)
* Manage routing
* Send responses (HTML, JSON, files, etc.)

### **Typical use:**

```js
const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.send('Hello world!');
});

app.listen(3000);
```

---

# ✅ **2. Axios**

### **What it is:**

A popular HTTP client library.

### **Purpose:**

* Send HTTP requests **from your Node.js backend** (or frontend)
* Call external APIs
* Handle JSON automatically
* Makes GET/POST requests easier than the built-in `fetch` (especially in backend)

### **Typical use:**

```js
const axios = require('axios');

axios.get('https://api.example.com/data')
  .then(res => console.log(res.data));
```

---

# ✅ **3. CORS**

### **What it is:**

A middleware package for handling **Cross-Origin Resource Sharing**.

### **Purpose:**

Allows your backend to accept requests from a different domain—this is essential when your **frontend and backend are on different ports**.

Example:
Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

Without CORS, browsers block requests.
With CORS, your backend explicitly says: “Yes, this frontend is allowed.”

### **Typical use:**

```js
const cors = require('cors');
app.use(cors());
```

---

# 📌 Summary

| Package     | Purpose                                          |
| ----------- | ------------------------------------------------ |
| **express** | Build APIs and servers                           |
| **axios**   | Make HTTP requests (e.g., call external APIs)    |
| **cors**    | Allow cross-origin requests (frontend ↔ backend) |

---

If you want, I can show you how to set up a **simple API using all three** packages.



================================================
FILE: package.json
================================================
{
  "name": "weather-app",
  "version": "1.0.0",
  "description": "",
  "license": "ISC",
  "author": "",
  "type": "commonjs",
  "main": "script.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "dependencies": {
    "axios": "^1.13.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1"
  },
  "keywords": []
}



================================================
FILE: server.js
================================================
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



================================================
FILE: public/index.html
================================================
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Simple Weather App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="container">
    <h1>Weather App</h1>

    <form id="searchForm" autocomplete="off">
      <input id="cityInput" type="text" placeholder="Enter city (e.g. Nairobi)" required />
      <button type="submit">Get Weather</button>
    </form>

    <div id="message" class="message"></div>

    <section id="result" class="result hidden">
      <h2 id="place"></h2>
      <div class="weather-row">
        <img id="icon" alt="weather icon" />
        <div>
          <p id="desc" class="desc"></p>
          <p class="temp"><span id="temp"></span>°C <small id="feels">(feels like)</small></p>
        </div>
      </div>

      <ul class="details">
        <li>Humidity: <span id="humidity"></span>%</li>
        <li>Wind: <span id="wind"></span> m/s</li>
      </ul>
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>



================================================
FILE: public/script.js
================================================
// script.js - frontend logic
// Attaches a submit handler to the form, calls /weather?city=..., and updates the DOM.

const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const messageEl = document.getElementById('message');
const resultEl = document.getElementById('result');

const placeEl = document.getElementById('place');
const descEl = document.getElementById('desc');
const iconEl = document.getElementById('icon');
const tempEl = document.getElementById('temp');
const feelsEl = document.getElementById('feels');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // stop the form from reloading the page

  const city = cityInput.value.trim();
  if (!city) return;

  // UI: show a quick message that we are loading
  messageEl.textContent = 'Loading...';
  resultEl.classList.add('hidden');

  try {
    // call our backend endpoint
    const res = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const data = await res.json();

    // Update UI with returned data
    placeEl.textContent = `${data.city}, ${data.country || ''}`;
    descEl.textContent = data.weather.description || data.weather.main || '';
    tempEl.textContent = Math.round(data.temp.current);
    feelsEl.textContent = `(feels like ${Math.round(data.temp.feels_like)}°C)`;
    humidityEl.textContent = data.temp.humidity ?? '—';
    windEl.textContent = data.wind.speed != null ? data.wind.speed : '—';

    // icon from OpenWeather (119x119) — we use the icon code the backend returned
    if (data.weather.icon) {
      iconEl.src = `https://openweathermap.org/img/wn/${data.weather.icon}@2x.png`;
      iconEl.alt = data.weather.description || 'weather';
      iconEl.style.display = 'block';
    } else {
      iconEl.style.display = 'none';
    }

    messageEl.textContent = '';
    resultEl.classList.remove('hidden');
  } catch (err) {
    // Show friendly message
    console.error('Fetch error:', err);
    messageEl.textContent = err.message || 'Could not get weather.';
    resultEl.classList.add('hidden');
  }
});



================================================
FILE: public/style.css
================================================
/* style.css - simple clean styling */
:root{
  --bg:#f5f7fb;
  --card:#ffffff;
  --accent:#1e90ff;
  --text:#222;
  --muted:#666;
}

*{box-sizing:border-box}
body{
  margin:0;
  font-family:Inter,system-ui,Segoe UI,Roboto,"Helvetica Neue",Arial;
  background:linear-gradient(180deg,var(--bg),#e9f1ff);
  color:var(--text);
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
}

.container{
  width:100%;
  max-width:520px;
  background:var(--card);
  border-radius:12px;
  padding:24px;
  box-shadow:0 6px 24px rgba(20,30,60,0.08);
}

h1{margin:0 0 12px 0;font-size:1.6rem}
form{
  display:flex;
  gap:8px;
  margin-bottom:12px;
}
input[type="text"]{
  flex:1;
  padding:10px 12px;
  border-radius:8px;
  border:1px solid #dce7ff;
  outline:none;
  font-size:1rem;
}
button{
  background:var(--accent);
  color:#fff;
  padding:10px 14px;
  border-radius:8px;
  border:0;
  cursor:pointer;
  font-weight:600;
}
.message{color:var(--muted); margin-bottom:10px}
.hidden{display:none}

.result{margin-top:10px}
.weather-row{display:flex; gap:14px; align-items:center}
.weather-row img{width:72px; height:72px}
.desc{text-transform:capitalize; color:var(--muted); margin:0 0 4px 0}
.temp{font-size:1.4rem; margin:0}
.details{list-style:none; padding:0; margin:12px 0 0 0; display:flex; gap:12px; color:var(--muted)}
.details li{font-size:0.95rem}

