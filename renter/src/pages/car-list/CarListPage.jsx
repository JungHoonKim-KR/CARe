import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import BottomNav from '../../components/BottomNav'
import './CarListPage.css'

const MOCK_CARS = [
  {
    id: 1,
    name: '메르세데스-벤츠 SL65 AMG',
    category: '럭셔리',
    year: '2024년 3월',
    mileage: '12,450 km/h',
    fuel: '가솔린',
    seats: 4,
    transmission: '자동',
    rating: 4.9,
    reviews: 230,
    pricePerDay: 1033,
    company: 'ORIX Rent-A-Car',
    color: '#e4e4e4',
    emoji: '🚗',
    services: {
      included: ['무료 GPS', '스노우 체인', '무제한 주행거리', '조건조건 1'],
      excluded: ['스노우 체인', '유아용 카시트'],
    },
  },
  {
    id: 2,
    name: 'BMW 5 시리즈 520d',
    category: '대형',
    year: '2023년 8월',
    mileage: '8,200 km/h',
    fuel: '디젤',
    seats: 5,
    transmission: '자동',
    rating: 4.7,
    reviews: 185,
    pricePerDay: 850,
    company: 'Times Car',
    color: '#d8e4f0',
    emoji: '🚙',
    services: {
      included: ['무료 GPS', '무제한 주행거리'],
      excluded: ['유아용 카시트'],
    },
  },
  {
    id: 3,
    name: 'Toyota RAV4',
    category: 'SUV',
    year: '2024년 1월',
    mileage: '5,300 km/h',
    fuel: '하이브리드',
    seats: 5,
    transmission: '자동',
    rating: 4.6,
    reviews: 142,
    pricePerDay: 620,
    company: 'Toyota Rent a Car',
    color: '#ddecd4',
    emoji: '🚐',
    services: {
      included: ['무료 GPS', '무제한 주행거리', '스노우 체인'],
      excluded: ['유아용 카시트'],
    },
  },
  {
    id: 4,
    name: 'Honda Civic',
    category: '중형',
    year: '2023년 5월',
    mileage: '15,700 km/h',
    fuel: '가솔린',
    seats: 5,
    transmission: '자동',
    rating: 4.5,
    reviews: 98,
    pricePerDay: 420,
    company: 'OTS Rent-A-Car',
    color: '#f0ece0',
    emoji: '🚗',
    services: {
      included: ['무료 GPS'],
      excluded: ['스노우 체인', '유아용 카시트'],
    },
  },
  {
    id: 5,
    name: 'Nissan Serena',
    category: '밴',
    year: '2023년 11월',
    mileage: '9,800 km/h',
    fuel: '가솔린',
    seats: 8,
    transmission: '자동',
    rating: 4.8,
    reviews: 67,
    pricePerDay: 780,
    company: 'Nippon Rent-A-Car',
    color: '#e0e4f0',
    emoji: '🚌',
    services: {
      included: ['무료 GPS', '무제한 주행거리'],
      excluded: ['유아용 카시트'],
    },
  },
  {
    id: 6,
    name: 'Toyota Aqua',
    category: '소형',
    year: '2024년 2월',
    mileage: '3,100 km/h',
    fuel: '하이브리드',
    seats: 5,
    transmission: '자동',
    rating: 4.4,
    reviews: 54,
    pricePerDay: 310,
    company: 'Times Car',
    color: '#e4f0e0',
    emoji: '🚗',
    services: {
      included: ['무료 GPS'],
      excluded: ['스노우 체인'],
    },
  },
]

const FILTERS = ['전체', '소형', '중형', '대형', 'SUV', '밴', '럭셔리']
const SORTS   = ['추천순', '가격 낮은순', '가격 높은순', '평점순']

export default function CarListPage() {
  const navigate   = useNavigate()
  const { state }  = useLocation()
  const searchInfo = state?.searchInfo || state || {}

  const [fi, setFi]   = useState(0)
  const [si, setSi]   = useState(0)
  const [favs, setFavs] = useState(new Set())

  const filtered = MOCK_CARS.filter(c => fi === 0 || c.category === FILTERS[fi])
  const sorted   = [...filtered].sort((a, b) => {
    if (si === 1) return a.pricePerDay - b.pricePerDay
    if (si === 2) return b.pricePerDay - a.pricePerDay
    if (si === 3) return b.rating - a.rating
    return 0
  })

  const toggleFav = (id, e) => {
    e.stopPropagation()
    setFavs(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const locationLabel = searchInfo.location || '픽업 위치를 선택하세요'
  const dateLabel     = searchInfo.pickupDate && searchInfo.returnDate
    ? `${searchInfo.pickupDate} ~ ${searchInfo.returnDate}`
    : '날짜를 선택하세요'

  return (
    <div className="cl-wrap">
      {/* ── 헤더 ─────────────────────────────── */}
      <header className="cl-header">
        <button className="cl-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="cl-header-info">
          <p className="cl-loc">{locationLabel}</p>
          <p className="cl-date">{dateLabel}</p>
        </div>
        <img src={careLogo} alt="CARe" className="cl-logo" />
      </header>

      {/* ── 필터 칩 ──────────────────────────── */}
      <div className="cl-filter-row">
        {FILTERS.map((f, i) => (
          <button key={f}
            className={`cl-chip${fi === i ? ' on' : ''}`}
            onClick={() => setFi(i)}>
            {f}
          </button>
        ))}
      </div>

      {/* ── 정렬 + 결과 수 ────────────────────── */}
      <div className="cl-sort-bar">
        <span className="cl-count">{sorted.length}개 차량</span>
        <div className="cl-sorts">
          {SORTS.map((s, i) => (
            <button key={s}
              className={`cl-sort${si === i ? ' on' : ''}`}
              onClick={() => setSi(i)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── 차량 목록 ─────────────────────────── */}
      <div className="cl-list">
        {sorted.map(car => (
          <div key={car.id} className="cl-card"
            onClick={() => navigate('/car-detail', { state: { car, searchInfo } })}>

            {/* 이미지 */}
            <div className="cl-img"
              style={{ background: `linear-gradient(145deg, ${car.color} 0%, #f7f7f7 100%)` }}>
              <span className="cl-emoji">{car.emoji}</span>
              <button className="cl-heart" onClick={e => toggleFav(car.id, e)}>
                {favs.has(car.id)
                  ? <svg width="19" height="19" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F7A633"/></svg>
                  : <svg width="19" height="19" viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="#ccc"/></svg>
                }
              </button>
            </div>

            {/* 정보 */}
            <div className="cl-info">
              <p className="cl-name">{car.name}</p>
              <div className="cl-meta">
                <span className="cl-star">★</span>
                <span className="cl-rv">{car.rating}</span>
                <span className="cl-rcnt">({car.reviews})</span>
                <span className="cl-dot-sep">·</span>
                <span className="cl-tag">{car.category}</span>
                <span className="cl-tag">{car.fuel}</span>
                <span className="cl-tag">좌석 {car.seats}</span>
              </div>
              <div className="cl-bottom">
                <p className="cl-price">
                  <span className="cl-pnum">{car.pricePerDay.toLocaleString()}</span>
                  <span className="cl-punit"> USDC/일</span>
                </p>
                <button className="cl-btn">보기</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
