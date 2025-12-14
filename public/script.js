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
