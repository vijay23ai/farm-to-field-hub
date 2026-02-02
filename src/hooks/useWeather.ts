import { useState, useCallback } from "react";

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: string;
  forecast: string;
  wind_speed: number;
  loading: boolean;
  error: string | null;
}

const initialState: WeatherData = {
  temperature: 0,
  humidity: 0,
  rainfall: "",
  forecast: "",
  wind_speed: 0,
  loading: false,
  error: null,
};

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>(initialState);

  const fetchWeather = useCallback(async (latitude: number, longitude: number) => {
    setWeather(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=precipitation_sum&timezone=auto`
      );
      
      if (!response.ok) throw new Error("Weather API error");
      
      const data = await response.json();
      const current = data.current;
      const daily = data.daily;

      // Map weather codes to descriptions
      const weatherCodeMap: { [key: number]: string } = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail",
      };

      const precipitation = daily?.precipitation_sum?.[0] || 0;
      let rainfall = "None";
      if (precipitation > 0 && precipitation < 5) rainfall = "Low";
      else if (precipitation >= 5 && precipitation < 20) rainfall = "Moderate";
      else if (precipitation >= 20) rainfall = "Heavy";

      setWeather({
        temperature: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        rainfall,
        forecast: weatherCodeMap[current.weather_code] || "Unknown",
        wind_speed: Math.round(current.wind_speed_10m),
        loading: false,
        error: null,
      });
    } catch (err) {
      setWeather(prev => ({
        ...prev,
        loading: false,
        error: "Failed to fetch weather data",
      }));
    }
  }, []);

  const resetWeather = useCallback(() => {
    setWeather(initialState);
  }, []);

  return { weather, fetchWeather, resetWeather };
};
