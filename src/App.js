import { useEffect } from "react";
import { useState } from "react";
function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}


function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}


function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}



function App() {

  const [location, setLocation] = useState('')
  const [locationName, setLocationName] = useState('')
  const [weather, setWeather] = useState('')
  const [isLoading, setIsLoading] = useState(false)



  const { temperature_2m_max: max, temperature_2m_min: min, time: dates, weathercode: codes } = weather;



  useEffect(() => {
    async function handleGetWeather(location) {
      try {
        // 1) Getting location (geocoding)
        if (location.length <= 2) {
          setWeather('')
          setLocationName('')
        }
        setIsLoading(true)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        );
        const geoData = await geoRes.json();

        if (!geoData.results) throw new Error("Location not found");

        const { latitude, longitude, timezone, name, country_code } =
          geoData.results.at(0);
        setLocationName(`${name} ${convertToFlag(country_code)}`);

        // 2) Getting actual weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
        );
        const weatherData = await weatherRes.json();
        setWeather(weatherData.daily);
      } catch (err) {
        console.log(err);
      }
      finally {
        setIsLoading(false)
      }
    }

    handleGetWeather(location)

  }, [location])



  return (
    <div className="app">
      <h1>🌞 Weather App 🌞</h1>
      <input type="text" placeholder="write city name..." value={location} onChange={(e) => setLocation(e.target.value)} />
      {weather && <h2>Weather in {locationName}</h2>}
      {isLoading && <p className="loader">Loading...</p>}

      <ul className="weather">
        {!weather ? null : dates.map((ele, index) =>
          <li className="day">
            <span>{getWeatherIcon(codes[index])}</span>
            <p>{index === 0 ? 'today' : formatDay(dates[index])}</p>

            <p>
              {Math.floor(min[index])}&deg; &mdash; <strong>{Math.ceil(max[index])}&deg;</strong>
            </p>

          </li>
        )}

      </ul>
    </div>

  );
}

export default App;
