// Get references to DOM elements
const locationInput = document.getElementById("locationInput");
const searchButton = document.getElementById("searchButton");
const geoButton = document.getElementById("geoButton");
const locationName = document.getElementById("locationName");
const currentTime = document.getElementById("currentTime");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const weatherDisplay = document.getElementById("weatherDisplay");
const forecastCards = document.getElementById("forecastCards");
const loadingSpinner = document.getElementById("loading");
const toggleTempBtn = document.getElementById("toggleTempBtn");

let isCelsius = true; // Default to Celsius

const apiKey = "d189c8cb73761ba95e2a788508ec13be"; // Replace with your actual API key

// Event listener for search button
searchButton.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (!location) {
    alert("Please enter a location.");
    return;
  }
  getWeatherByCity(location);
});

// Event listener for geolocation button
geoButton.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      getWeatherByCoords(position.coords.latitude, position.coords.longitude);
    }, () => {
      alert("Unable to retrieve your location.");
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

// Event listener for temperature toggle
toggleTempBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  toggleTempBtn.textContent = isCelsius ? "Switch to °F" : "Switch to °C";
  updateTemperature();
});

// Function to fetch weather data for a city
function getWeatherByCity(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetchWeather(apiUrl);
}

// Function to fetch weather data using coordinates
function getWeatherByCoords(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetchWeather(apiUrl);
}

// Function to fetch and update weather data
function fetchWeather(apiUrl) {
  loadingSpinner.style.display = "block"; // Show loading spinner
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error("Location not found");
      return response.json();
    })
    .then(data => {
      locationName.textContent = data.name;
      const time = new Date(data.dt * 1000).toLocaleString();
      currentTime.textContent = `Current time: ${time}`;
      description.textContent = `Description: ${data.weather[0].description}`;
      weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      weatherIcon.alt = data.weather[0].main;
      weatherIcon.style.display = "block";
      forecastCards.innerHTML = "";
      weatherDisplay.style.display = "block";
      fetchForecast(data.coord.lat, data.coord.lon);
      updateTemperature(data.main.temp);
    })
    .catch(error => {
      weatherDisplay.style.display = "none";
      alert(error.message);
    })
    .finally(() => {
      loadingSpinner.style.display = "none"; // Hide loading spinner
    });
}

// Function to update temperature based on the unit
function updateTemperature(temp) {
  if (isCelsius) {
    temperature.textContent = `Temperature: ${temp}°C`;
  } else {
    const tempF = (temp * 9/5) + 32;
    temperature.textContent = `Temperature: ${tempF.toFixed(2)}°F`;
  }
}

// Function to fetch the 5-day forecast
function fetchForecast(lat, lon) {
  const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(forecastApiUrl)
    .then(response => response.json())
    .then(data => {
      const forecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));
      forecast.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("forecast-card");
        card.innerHTML = `
          <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
          <p>${new Date(item.dt * 1000).toLocaleDateString()}</p>
          <p>${item.main.temp}°C</p>
        `;
        forecastCards.appendChild(card);
      });
    });
}
