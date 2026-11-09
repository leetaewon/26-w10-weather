import { useState, useEffect, useCallback } from 'react'
import {
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
} from './api/weather'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import './App.css'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 특정 도시 데이터 수동 갱신 (새로고침 버튼용)
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
      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    } catch (err) {
      console.error('데이터 조회 오류:', err)
      setError(err.message || '기상 데이터를 불러오는 중 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 도시 선택 변경 시 데이터 갱신 (경쟁 상태 방지 클린업)
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
          setLastUpdated(
            new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          )
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

      {/* 도시 검색창 (400ms 디바운스 + 드롭다운) */}
      <section className="search-section">
        <CitySearch onSelectCity={(city) => setSelectedCity(city)} />
      </section>

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

      {/* 상태 툴바 (위치, 업데이트 시각, 새로고침) */}
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

      {/* 본문 콘텐츠 영역 */}
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

        {!loading && !error && weatherData && (
          <div className="dashboard-grid">
            {/* 1행: 현재 날씨 + 미세먼지 카드 (2열 그리드) */}
            <div className="primary-cards-grid">
              <CurrentWeather city={selectedCity} currentWeather={weatherData.current} />
              <AirQualityCard city={selectedCity} airQuality={airQualityData} />
            </div>

            {/* 2행: 24시간 시간대별 기온 SVG 차트 */}
            <HourlyChart hourly={weatherData.hourly} />

            {/* 3행: 7일간 주간 날씨 예보 */}
            <WeeklyForecast daily={weatherData.daily} />
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="dashboard-footer">
        <p>
          실시간 데이터 출처:{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>{' '}
          Public Weather &amp; Air Quality API
        </p>
      </footer>
    </div>
  )
}
