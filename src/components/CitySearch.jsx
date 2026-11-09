import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      setIsOpen(false)
    }
  }

  // 400ms 디바운스(Debounce) 적용 검색
  useEffect(() => {
    if (query.trim().length < 2) return

    let isSubscribed = true
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await searchCities(query)
        if (isSubscribed) {
          setResults(data)
          setIsOpen(true)
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('검색 실패:', err)
          setResults([])
        }
      } finally {
        if (isSubscribed) {
          setIsSearching(false)
        }
      }
    }, 400)

    return () => {
      isSubscribed = false
      clearTimeout(timer)
    }
  }, [query])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (city) => {
    const displayName = city.admin1 ? `${city.name}, ${city.admin1}` : city.name
    const fullName = city.country ? `${displayName} (${city.country})` : displayName

    onSelectCity({
      name: fullName,
      lat: city.latitude,
      lon: city.longitude,
    })
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 이름 검색 (예: Seoul, Busan, Tokyo, Paris, New York...)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {isSearching && <Loader2 size={18} className="search-status-icon spin" />}
        {!isSearching && query && (
          <button type="button" className="clear-btn" onClick={handleClear} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((city) => (
                <li key={`${city.id}-${city.latitude}-${city.longitude}`}>
                  <button
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelect(city)}
                  >
                    <MapPin size={16} className="item-icon" />
                    <div className="item-info">
                      <span className="item-name">{city.name}</span>
                      <span className="item-location">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            query.trim().length >= 2 && !isSearching && (
              <div className="search-no-results">
                검색 결과가 없습니다. (영문 도시명을 입력해 보세요)
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
