import { useMemo } from 'react'
import { Clock } from 'lucide-react'

export default function HourlyChart({ hourly }) {
  // 24시간 시간별 기온 데이터 추출 (당일 00시부터 24시간)
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.temperature_2m) return null

    const sliceTimes = hourly.time.slice(0, 24)
    const sliceTemps = hourly.temperature_2m.slice(0, 24)

    const points = sliceTimes.map((isoTime, idx) => {
      // "2026-11-09T03:00" -> "03:00"
      const timeStr = isoTime.includes('T') ? isoTime.split('T')[1].slice(0, 5) : isoTime
      return {
        time: timeStr,
        temp: sliceTemps[idx],
      }
    })

    const temps = points.map((p) => p.temp)
    let minTemp = Math.min(...temps)
    let maxTemp = Math.max(...temps)

    // 온도차가 너무 작을 때 시각적 여백 확보
    if (maxTemp - minTemp < 3) {
      minTemp -= 1.5
      maxTemp += 1.5
    }

    return {
      points,
      minTemp,
      maxTemp,
      maxVal: Math.max(...temps),
      minVal: Math.min(...temps),
    }
  }, [hourly])

  if (!chartData || chartData.points.length === 0) return null

  const { points, minTemp, maxTemp, maxVal, minVal } = chartData

  // SVG 좌표 계산
  const width = 800
  const height = 180
  const padX = 40
  const padTop = 35
  const padBottom = 40
  const drawWidth = width - padX * 2
  const drawHeight = height - padTop - padBottom

  const coords = points.map((p, idx) => {
    const x = padX + (idx / (points.length - 1)) * drawWidth
    const ratio = (maxTemp - p.temp) / (maxTemp - minTemp)
    const y = padTop + ratio * drawHeight
    return { ...p, x, y }
  })

  // 폴리라인 좌표 문자열
  const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')

  // 영역 채우기용 Path
  const areaPath = `
    M ${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}
    ${coords.map((c) => `L ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')}
    L ${coords[coords.length - 1].x.toFixed(1)},${height - padBottom}
    L ${coords[0].x.toFixed(1)},${height - padBottom}
    Z
  `

  return (
    <article className="card hourly-card">
      <div className="card-top">
        <div>
          <span className="card-subtitle">시간대별 예보</span>
          <h2 className="card-city">24시간 기온 추이</h2>
        </div>
        <div className="hourly-summary-badges">
          <span className="summary-chip high">
            최고 {Math.round(maxVal)}°
          </span>
          <span className="summary-chip low">
            최저 {Math.round(minVal)}°
          </span>
        </div>
      </div>

      <div className="chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="hourly-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 배경 그라데이션 영역 */}
          <path d={areaPath} fill="url(#tempAreaGradient)" />

          {/* 꺾은선 */}
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* 데이터 포인트 및 라벨 (3시간 간격 및 첫/마지막 포인트 강조) */}
          {coords.map((c, idx) => {
            const isKeyPoint = idx % 3 === 0 || idx === coords.length - 1
            if (!isKeyPoint) return null

            return (
              <g key={idx} className="chart-point-group">
                {/* 수직 보조선 */}
                <line
                  x1={c.x}
                  y1={c.y}
                  x2={c.x}
                  y2={height - padBottom}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  opacity="0.6"
                />

                {/* 포인트 원 */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="4.5"
                  fill="var(--bg)"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />

                {/* 온도 수치 텍스트 */}
                <text
                  x={c.x}
                  y={c.y - 10}
                  textAnchor="middle"
                  className="chart-temp-label"
                >
                  {Math.round(c.temp)}°
                </text>

                {/* 시간 라벨 */}
                <text
                  x={c.x}
                  y={height - padBottom + 20}
                  textAnchor="middle"
                  className="chart-time-label"
                >
                  {c.time}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="hourly-footer-hint">
        <Clock size={13} />
        <span>향후 24시간 동안의 기온 흐름입니다. (3시간 간격 표시)</span>
      </div>
    </article>
  )
}
