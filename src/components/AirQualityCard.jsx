import { getAirQualityStatus } from '../api/weather'

export default function AirQualityCard({ city, airQuality }) {
  if (!airQuality || !airQuality.current) return null

  const currentAir = airQuality.current
  const airStatus = getAirQualityStatus(currentAir.pm10, currentAir.pm2_5)

  return (
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
          현재 {city.name}의 대기질 상태는{' '}
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
  )
}

