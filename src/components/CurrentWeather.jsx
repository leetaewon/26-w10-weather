import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react'
import { getWeatherInfo } from '../api/weather'

const WEATHER_ICONS = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
}

function WeatherDynamicIcon({ name, size = 48, color }) {
  const IconComponent = WEATHER_ICONS[name] || Cloud
  return <IconComponent size={size} color={color} strokeWidth={1.75} />
}

export default function CurrentWeather({ city, currentWeather }) {
  if (!currentWeather) return null

  const info = getWeatherInfo(currentWeather.weather_code)

  return (
    <article className="card weather-card">
      <div className="card-top">
        <div>
          <span className="card-subtitle">현재 날씨</span>
          <h2 className="card-city">{city.name}</h2>
        </div>
        <div
          className="weather-badge"
          style={{
            color: info.color,
            borderColor: `${info.color}40`,
            backgroundColor: `${info.color}15`,
          }}
        >
          <WeatherDynamicIcon name={info.icon} size={20} color={info.color} />
          <span>{info.label}</span>
        </div>
      </div>

      <div className="temp-hero">
        <div className="weather-icon-wrapper" style={{ backgroundColor: `${info.color}15` }}>
          <WeatherDynamicIcon name={info.icon} size={64} color={info.color} />
        </div>
        <div className="temp-value-box">
          <span className="main-temp">{Math.round(currentWeather.temperature_2m)}°</span>
          <span className="temp-unit">C</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-header">
            <Thermometer size={16} className="metric-icon" />
            <span>체감 온도</span>
          </div>
          <strong className="metric-value">
            {Math.round(currentWeather.apparent_temperature)}°C
          </strong>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <Droplets size={16} className="metric-icon" />
            <span>습도</span>
          </div>
          <strong className="metric-value">
            {currentWeather.relative_humidity_2m}%
          </strong>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <Wind size={16} className="metric-icon" />
            <span>풍속</span>
          </div>
          <strong className="metric-value">
            {currentWeather.wind_speed_10m} km/h
          </strong>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <CloudRain size={16} className="metric-icon" />
            <span>강수량</span>
          </div>
          <strong className="metric-value">
            {currentWeather.precipitation ?? 0} mm
          </strong>
        </div>
      </div>
    </article>
  )
}

