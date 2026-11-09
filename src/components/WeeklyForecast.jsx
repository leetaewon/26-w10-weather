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
  Droplets,
  Calendar,
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

function WeatherDynamicIcon({ name, size = 24, color }) {
  const IconComponent = WEATHER_ICONS[name] || Cloud
  return <IconComponent size={size} color={color} strokeWidth={1.75} />
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time || daily.time.length === 0) return null

  // 7일간 전체 최고/최저 기온 계산 (게이지 바 비율 산출용)
  const allMax = Math.max(...daily.temperature_2m_max)
  const allMin = Math.min(...daily.temperature_2m_min)
  const tempRange = allMax - allMin || 1

  return (
    <article className="card weekly-card">
      <div className="card-top">
        <div>
          <span className="card-subtitle">주간 일기예보</span>
          <h2 className="card-city">7일간 날씨 전망</h2>
        </div>
        <div className="weekly-header-badge">
          <Calendar size={14} />
          <span>7-Day Forecast</span>
        </div>
      </div>

      <div className="weekly-list">
        {daily.time.slice(0, 7).map((dateStr, idx) => {
          const date = new Date(dateStr)
          const dayName =
            idx === 0
              ? '오늘'
              : idx === 1
              ? '내일'
              : `${WEEKDAYS[date.getDay()]}요일`
          const formattedDate = `${date.getMonth() + 1}.${date.getDate()}`

          const code = daily.weather_code[idx]
          const info = getWeatherInfo(code)
          const minTemp = Math.round(daily.temperature_2m_min[idx])
          const maxTemp = Math.round(daily.temperature_2m_max[idx])
          const precipProb = daily.precipitation_probability_max
            ? daily.precipitation_probability_max[idx]
            : null

          // 게이지 바 좌측 오프셋과 너비 계산
          const leftPercent = Math.max(0, ((daily.temperature_2m_min[idx] - allMin) / tempRange) * 100)
          const barWidth = Math.max(15, ((daily.temperature_2m_max[idx] - daily.temperature_2m_min[idx]) / tempRange) * 100)

          return (
            <div key={dateStr} className={`weekly-row ${idx === 0 ? 'today-row' : ''}`}>
              {/* 요일 및 날짜 */}
              <div className="weekly-day-box">
                <span className="weekly-day-name">{dayName}</span>
                <span className="weekly-date-sub">{formattedDate}</span>
              </div>

              {/* 날씨 아이콘 & 상태 */}
              <div className="weekly-weather-info">
                <WeatherDynamicIcon name={info.icon} size={26} color={info.color} />
                <span className="weekly-weather-label">{info.label}</span>
              </div>

              {/* 강수 확률 */}
              <div className="weekly-precip-box">
                {precipProb !== null && precipProb > 0 ? (
                  <span className="weekly-precip">
                    <Droplets size={12} /> {precipProb}%
                  </span>
                ) : (
                  <span className="weekly-precip empty">-</span>
                )}
              </div>

              {/* 기온 범위 막대 (최저 - 바 - 최고) */}
              <div className="weekly-temp-range">
                <span className="weekly-min-temp">{minTemp}°</span>
                <div className="temp-bar-track">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
                <span className="weekly-max-temp">{maxTemp}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

