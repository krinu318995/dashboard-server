import React, { useState, useEffect } from "react";
import "../../assets/styles/ClockWeather.css";
import type { WeatherData } from "../../types/dashboard.ts";

export const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  useEffect(() => {
    const fetchWeatherData = async (lat: number, lon: number) => {
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

      try {
        const response = await fetch(URL);
        if (!response.ok) {
          throw new Error("날씨 정보를 가져오는데 실패했습니다.");
        }
        const data = await response.json();
        const iconCode = data.weather[0].icon;
        let emojiIcon = "☀️";
        if (iconCode === "02" || iconCode === "03" || iconCode === "04")
          emojiIcon = "☁️";
        else if (iconCode.startsWith("09") || iconCode.startsWith("10"))
          emojiIcon = "🌧️";
        else if (iconCode.startsWith("11")) emojiIcon = "⛈️";
        else if (iconCode.startsWith("13")) emojiIcon = "❄️";
        else if (iconCode.startsWith("50")) emojiIcon = "🌫️";

        setWeatherData({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].description,
          icon: emojiIcon,
          city: data.name,
          humidity: data.main.humidity + "%",
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
      });
    }
  }, []);

  return (
    <div className="weather-widget-container">
      {weatherData ? (
        <>
          <div className="weather-widget-icon">{weatherData?.icon}</div>
          <div className="weather-widget-info">
            <div className="weather-widget-temp">{weatherData?.temp}°C</div>
            <div className="weather-widget-condition">
              {weatherData?.condition}
            </div>
            <div className="weather-widget-city">{weatherData?.city}</div>
          </div>
        </>
      ) : (
        <div>날씨 정보를 가져오는 중...</div>
      )}
    </div>
  );
};
