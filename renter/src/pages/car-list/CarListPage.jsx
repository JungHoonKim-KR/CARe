import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import BottomNav from '../../components/BottomNav'
import './CarListPage.css'

const MOCK_CARS = [
  {
    id: 1,
    name: 'SL65 AMG',
    fullName: '메르세데스-벤츠 SL65 AMG',
    category: '럭셔리',
    year: '2024년 3월',
    mileage: '12,450 km',
    fuel: '가솔린',
    seats: 5,
    doors: 2,
    transmission: '자동',
    rating: 4.8,
    reviews: 230,
    pricePerDay: 1033,
    company: 'ORIX Rent-A-Car',
    color: '#e4e4e4',
    emoji: '🚗',
  },
  {
    id: 2,
    name: 'SL65 AMG',
    fullName: '메르세데스-벤츠 SL65 AMG',
    category: '럭셔리',
    year: '2024년 3월',
    mileage: '8,200 km',
    fuel: '가솔린',
    seats: 5,
    doors: 2,
    transmission: '자동',
    rating: 4.8,
    reviews: 185,
    pricePerDay: 1038,
    company: 'Nippon Rent-A-Car',
    color: '#e4e4e4',
    emoji: '🚗',
  },
  {
    id: 3,
    name: 'G클래스',
    fullName: 'Mercedes-Benz G클래스',
    category: '럭셔리',
    year: '2024년 1월',
    mileage: '5,300 km',
    fuel: '가솔린',
    seats: 5,
    doors: 2,
    transmission: '자동',
    rating: 4.8,
    reviews: 142,
    pricePerDay: 1139,
    company: 'ジャパン24レンタカー',
    color: '#2a2a2a',
    emoji: '🚙',
  },
  {
    id: 4,
    name: 'G클래스',
    fullName: 'Mercedes-Benz G클래스',
    category: '럭셔리',
    year: '2023년 5월',
    mileage: '15,700 km',
    fuel: '가솔린',
    seats: 5,
    doors: 2,
    transmission: '자동',
    rating: 4.5,
    reviews: 98,
    pricePerDay: 1150,
    company: 'Times Car',
    color: '#2a2a2a',
    emoji: '🚙',
  },
  {
    id: 5,
    name: 'BMW 5시리즈',
    fullName: 'BMW 5 시리즈 520d',
    category: '대형',
    year: '2023년 11월',
    mileage: '9,800 km',
    fuel: '디젤',
    seats: 5,
    doors: 4,
    transmission: '자동',
    rating: 4.7,
    reviews: 67,
    pricePerDay: 850,
    company: 'Nippon Rent-A-Car',
    color: '#d8e4f0',
    emoji: '🚗',
  },
  {
    id: 6,
    name: 'Toyota RAV4',
    fullName: 'Toyota RAV4 하이브리드',
    category: 'SUV',
    year: '2024년 2월',
    mileage: '3,100 km',
    fuel: '하이브리드',
    seats: 5,
    doors: 4,
    transmission: '자동',
    rating: 4.6,
    reviews: 54,
    pricePerDay: 620,
    company: 'Toyota Rent a Car',
    color: '#ddecd4',
    emoji: '🚐',
  },
]

const FILTERS = ['전체', '소형', '중형', '대형', 'SUV', '밴', '럭셔리']
const SORTS   = ['추천순', '가격 낮은순', '가격 높은순', '평점순']
const PAGE_SIZE = 5

export default function CarListPage() {
  const navigate   = useNavigate()
  const { state }  = useLocation()
  const searchInfo = state?.searchInfo || state || {}

  const [fi, setFi]     = useState(0)
  const [si, setSi]     = useState(0)
  const [page, setPage] = useState(1)
  const [favs, setFavs] = useState(new Set())

  const filtered = MOCK_CARS.filter(c => fi === 0 || c.category === FILTERS[fi])
  const sorted   = [...filtered].sort((a, b) => {
    if (si === 1) return a.pricePerDay - b.pricePerDay
    if (si === 2) return b.pricePerDay - a.pricePerDay
    if (si === 3) return b.rating - a.rating
    return 0
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged      = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleFav = (id, e) => {
    e.stopPropagation()
    setFavs(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const handleFilter = (i) => { setFi(i); setPage(1) }
  const handleSort   = (i) => { setSi(i); setPage(1) }

  const locationLabel = searchInfo.location || '픽업 위치를 선택하세요'
  const dateLabel     = searchInfo.pickupDate && searchInfo.returnDate
    ? `${searchInfo.pickupDate} ~ ${searchInfo.returnDate}`
    : '날짜를 선택하세요'

  return (
    <div className="cl-wrap">
      {/* 헤더 */}
      <header className="cl-header">
        <button className="cl-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="cl-header-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#aaa" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="cl-header-info">
            <p className="cl-loc">{locationLabel}</p>
            <p className="cl-date">{dateLabel}</p>
          </div>
        </div>
        <img src={careLogo} alt="CARe" className="cl-logo" />
      </header>

      {/* 필터 칩 */}
      <div className="cl-filter-row">
        {FILTERS.map((f, i) => (
          <button key={f}
            className={"cl-chip" + (fi === i ? ' on' : '')}
            onClick={() => handleFilter(i)}>
            {f}
          </button>
        ))}
      </div>

      {/* 정렬 + 결과 수 */}
      <div className="cl-sort-bar">
        <span className="cl-count">검색 결과 <strong>{sorted.length}개</strong></span>
        <div className="cl-sorts">
          {SORTS.map((s, i) => (
            <button key={s}
              className={"cl-sort" + (si === i ? ' on' : '')}
              onClick={() => handleSort(i)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 차량 목록 */}
      <div className="cl-list">
        {paged.map(car => (
          <div key={car.id} className="cl-card"
            onClick={() => navigate('/car-detail', { state: { car, searchInfo } })}>

            {/* 왼쪽: 차량 이미지 */}
            <div className="cl-img-wrap"
              style={{ background: `linear-gradient(145deg, ${car.color}55 0%, #f7f7f7 100%)` }}>
              <span className="cl-emoji">{car.emoji}</span>
              <button className="cl-heart" onClick={e => toggleFav(car.id, e)}>
                {favs.has(car.id)
                  ? <svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F7A633"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="#ccc"/></svg>
                }
              </button>
            </div>

            {/* 오른쪽: 차량 정보 */}
            <div className="cl-info">
              <p className="cl-name">{car.name}</p>
              <div className="cl-meta">
                <span className="cl-star">★</span>
                <span className="cl-rv">{car.rating}</span>
                <span className="cl-meta-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="9" cy="7" r="4" stroke="#aaa" strokeWidth="2"/>
                  </svg>
                  {car.seats}
                </span>
                <span className="cl-meta-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="7" width="20" height="14" rx="2" stroke="#aaa" strokeWidth="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#aaa" strokeWidth="2"/>
                  </svg>
                  {car.doors}
                </span>
              </div>

              {/* 회사 + 가격 */}
              <div className="cl-bottom-row">
                <span className="cl-company">{car.company}</span>
                <span className="cl-price-pill">
                  {car.pricePerDay.toLocaleString()} USDC
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="cl-pagination">
          <button
            className="cl-page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={"cl-page-num" + (page === p ? ' active' : '')}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="cl-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
