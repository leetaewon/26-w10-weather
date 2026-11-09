import { useState, useEffect, useCallback } from 'react'
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
  MapPin,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather'
import './App.css'

// WMO 날씨 코드별 아이콘 매핑 헬퍼
const ICON_COMPONENTS = {
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
  const IconComponent = ICON_COMPONENTS[name] || Cloud
  return <IconComponent size={size} color={color} strokeWidth={1.75} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 날씨 및 미세먼지 데이터 동시 조회
  const loadCityData = useCallback(async (city) => {
    setLoading(true)
    setError(null)

    try {
      const [weatherRes, airRes] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])

      setWeatherData(weatherRes)
      setAirQualityData(airRes)
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (err) {
      console.error('데이터 조회 오류:', err)
      setError(err.message || '기상 데이터를 불러오는 중 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 도시 선택 변경 시 데이터 갱신
  useEffect(() => {
    let ignore = false

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [weatherRes, airRes] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ])

        if (!ignore) {
          setWeatherData(weatherRes)
          setAirQualityData(airRes)
          setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        }
      } catch (err) {
        if (!ignore) {
          console.error('데이터 조회 오류:', err)
          setError(err.message || '기상 데이터를 불러오는 중 문제가 발생했습니다.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [selectedCity])

  // 현재 날씨 정보 파싱
  const currentWeather = weatherData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null

  // 미세먼지 정보 파싱
  const currentAir = airQualityData?.current
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="dashboard-container">
      {/* 대시보드 헤더 */}
      <header className="dashboard-header">
        <div className="header-badge">
          <Sparkles size={14} /> Open-Meteo 실시간 연동
        </div>
        <h1 className="header-title">실시간 날씨 &amp; 미세먼지 대시보드</h1>
        <p className="header-desc">
          전 세계 기상 관측 네트워크 API를 활용해 대한민국의 실시간 기상 상태를 안내합니다.
        </p>
      </header>

      {/* 주요 도시 빠른 선택 버튼 바 */}
      <section className="city-selector-section">
        <div className="city-chips">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-chip ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                <MapPin size={15} />
                <span>{city.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 상태 표시 (업데이트 시간 & 새로고침 버튼) */}
      <div className="status-toolbar">
        <div className="current-location-text">
          선택된 위치: <strong>{selectedCity.name}</strong>
          {lastUpdated && (
            <span className="last-update">
              <Clock size={13} /> {lastUpdated} 갱신
            </span>
          )}
        </div>
        <button
          type="button"
          className="refresh-btn"
          onClick={() => loadCityData(selectedCity)}
          disabled={loading}
          title="데이터 새로고침"
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>새로고침</span>
        </button>
      </div>

      {/* 본문 콘텐츠 영역: 로딩, 에러 또는 데이터 카드 */}
      <main className="content-area">
        {loading && (
          <div className="state-card loading-card">
            <RefreshCw size={36} className="spin accent-icon" />
            <h3>기상 데이터를 불러오는 중...</h3>
            <p>{selectedCity.name}의 최신 기온 및 대기질 정보를 가져오고 있습니다.</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-card error-card">
            <AlertCircle size={40} className="error-icon" />
            <h3>데이터를 불러오지 못했습니다</h3>
            <p className="error-text">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={() => loadCityData(selectedCity)}
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && currentWeather && currentAir && (
          <div className="cards-grid">
            {/* 1. 현재 날씨 카드 */}
            <article className="card weather-card">
              <div className="card-top">
                <div>
                  <span className="card-subtitle">현재 날씨</span>
                  <h2 className="card-city">{selectedCity.name}</h2>
                </div>
                <div
                  className="weather-badge"
                  style={{ color: weatherInfo.color, borderColor: `${weatherInfo.color}40`, backgroundColor: `${weatherInfo.color}15` }}
                >
                  <WeatherDynamicIcon name={weatherInfo.icon} size={20} color={weatherInfo.color} />
                  <span>{weatherInfo.label}</span>
                </div>
              </div>

              <div className="temp-hero">
                <div className="weather-icon-wrapper" style={{ backgroundColor: `${weatherInfo.color}15` }}>
                  <WeatherDynamicIcon name={weatherInfo.icon} size={64} color={weatherInfo.color} />
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

            {/* 2. 미세먼지 카드 */}
            <article className="card air-card">
              <div className="card-top">
                <div>
                  <span className="card-subtitle">대기질 환경</span>
                  <h2 className="card-city">미세먼지 현황</h2>
                </div>
                <span
                  className="aqi-badge"
                  style={{ backgroundColor: airStatus.badgeColor }}
                >
                  {airStatus.status}
                </span>
              </div>

              <div className="air-summary">
                <p className="air-summary-text">
                  현재 {selectedCity.name}의 대기질 상태는{' '}
                  <strong style={{ color: airStatus.badgeColor }}>
                    '{airStatus.status}'
                  </strong>{' '}
                  수준입니다.
                </p>
              </div>

              <div className="air-metrics-grid">
                <div className="air-metric-box">
                  <div className="air-label-group">
                    <span className="air-label">미세먼지 (PM10)</span>
                    <span className="air-standard">기준 0~30 좋음 / 81~ 나쁨</span>
                  </div>
                  <div className="air-val-row">
                    <span className="air-val-number">{Math.round(currentAir.pm10)}</span>
                    <span className="air-val-unit">μg/m³</span>
                  </div>
                </div>

                <div className="air-metric-box">
                  <div className="air-label-group">
                    <span className="air-label">초미세먼지 (PM2.5)</span>
                    <span className="air-standard">기준 0~15 좋음 / 36~ 나쁨</span>
                  </div>
                  <div className="air-val-row">
                    <span className="air-val-number">{Math.round(currentAir.pm2_5)}</span>
                    <span className="air-val-unit">μg/m³</span>
                  </div>
                </div>

                {currentAir.european_aqi !== undefined && (
                  <div className="air-metric-box full-width">
                    <div className="air-label-group">
                      <span className="air-label">유럽 공기질 지수 (AQI)</span>
                      <span className="air-standard">European Air Quality Index</span>
                    </div>
                    <div className="air-val-row">
                      <span className="air-val-number">{currentAir.european_aqi}</span>
                      <span className="air-val-unit">AQI</span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="dashboard-footer">
        <p>실시간 데이터 출처: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> Public Weather &amp; Air Quality API</p>
      </footer>
    </div>
  )
}
