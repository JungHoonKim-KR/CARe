import { useState, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import mapIcon from '../../assets/map_icon.png'
import carIcon from '../../assets/car_icon.png'
import companyIcon from '../../assets/company_icon.png'
import BottomNav from '../../components/BottomNav'
import BottomSheet from '../../components/BottomSheet'
import DatePickerModal from '../../components/DatePickerModal'
import './HomePage.css'

const COUNTRIES = [
  { name: '대한민국, KR', sub: 'Republic of Korea' },
  { name: '일본, JP', sub: 'Japan' },
  { name: '미국, US', sub: 'United States of America' },
  { name: '프랑스, FR', sub: 'France' },
  { name: '독일, DE', sub: 'Germany' },
  { name: '이탈리아, IT', sub: 'Italy' },
  { name: '스페인, ES', sub: 'Spain' },
  { name: '태국, TH', sub: 'Thailand' },
]

const AIRPORTS = {
  KR: [
    { name: '인천국제공항, ICN', sub: 'Incheon Int. Airport' },
    { name: '김포국제공항, GMP', sub: 'Gimpo Int. Airport' },
  ],
  JP: [
    { name: '나리타, 도쿄 NRT', sub: 'Narita Int. Airport' },
    { name: '하네다 도쿄, HND', sub: 'Haneda Int. Airport' },
    { name: '간사이, 오사카 KIX', sub: 'Kansai Int. Airport' },
  ],
  DEFAULT: [
    { name: '국제공항 1', sub: 'International Airport' },
    { name: '국제공항 2', sub: 'International Airport' },
  ],
}

const CAR_TYPES = ['전체', '소형', '중형', '대형', 'SUV', '밴', '럭셔리']

const initialFormState = {
  country: '',
  countryCode: '',
  location: '',
  pickupDate: '',
  pickupTime: '10:00',
  returnDate: '',
  returnTime: '10:00',
  carType: '',
  showAll: true,
}

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_FIELDS':
      return { ...state, ...action.fields }
    case 'RESET':
      return initialFormState
    default:
      return state
  }
}

export default function HomePage() {
  const navigate = useNavigate()

  const didVerified =
    localStorage.getItem('passport_verified') === 'true' &&
    localStorage.getItem('license_verified') === 'true'

  const [form, dispatch] = useReducer(formReducer, initialFormState)
  const setForm = (updater) => {
    if (typeof updater === 'function') {
      dispatch({ type: 'SET_FIELDS', fields: updater(form) })
    } else {
      dispatch({ type: 'SET_FIELDS', fields: updater })
    }
  }

  const [showDidAlert, setShowDidAlert] = useState(false)

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('did_alert_shown')
    if (!didVerified && !alreadyShown) {
      const t = setTimeout(() => {
        setShowDidAlert(true)
        sessionStorage.setItem('did_alert_shown', 'true')
      }, 800)
      return () => clearTimeout(t)
    }
  }, [])

  const [countrySheet, setCountrySheet] = useState(false)
  const [airportSheet, setAirportSheet] = useState(false)
  const [carTypeSheet, setCarTypeSheet] = useState(false)
  const [dateModal, setDateModal] = useState(null)
  const [countrySearch, setCountrySearch] = useState('')
  const [airportSearch, setAirportSearch] = useState('')

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.sub.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const airportList = AIRPORTS[form.countryCode] || AIRPORTS.DEFAULT
  const filteredAirports = airportList.filter(
    (a) =>
      a.name.toLowerCase().includes(airportSearch.toLowerCase()) ||
      a.sub.toLowerCase().includes(airportSearch.toLowerCase())
  )

  const selectCountry = (c) => {
    const code = c.name.split(', ')[1]
    setForm((p) => ({ ...p, country: c.name, countryCode: code, location: '' }))
    setCountrySheet(false)
    setCountrySearch('')
  }

  const selectAirport = (a) => {
    setForm((p) => ({ ...p, location: a.name }))
    setAirportSheet(false)
    setAirportSearch('')
  }

  const selectDate = (dateStr) => {
    if (dateModal === 'pickup') setForm((p) => ({ ...p, pickupDate: dateStr }))
    else setForm((p) => ({ ...p, returnDate: dateStr }))
    setDateModal(null)
  }

  const handleSearch = () => {
    navigate('/car-list', {
      state: {
        searchInfo: {
          country: form.country,
          countryCode: form.countryCode,
          location: form.location,
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime,
          returnDate: form.returnDate,
          returnTime: form.returnTime,
          carType: form.carType,
        },
      },
    })
  }

  return (
    <div className="home-container">
      {/* DID 미인증 알림 */}
      {showDidAlert && (
        <div className="did-alert-overlay" onClick={() => setShowDidAlert(false)}>
          <div className="did-alert-box" onClick={(e) => e.stopPropagation()}>
            <div className="did-alert-icon">🪪</div>
            <p className="did-alert-title">개인정보 인증을 안 하셨네요!</p>
            <p className="did-alert-desc">3분 안에 하실 수 있어요.<br />지금 바로 신원 인증 하러 가실래요?</p>
            <div className="did-alert-btns">
              <button
                className="did-alert-confirm"
                onClick={() => { setShowDidAlert(false); navigate('/did-auth') }}
              >
                하러가기
              </button>
              <button
                className="did-alert-cancel"
                onClick={() => setShowDidAlert(false)}
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 헤더 */}
      <header className="home-header">
        <img src={careLogo} alt="CARe" className="home-logo" />
        <div className="home-header-right">
          <button className="lang-btn">
            <span className="lang-icon">🌐</span>
            <span>한국어</span>
          </button>
          <span
            className={`did-badge ${didVerified ? 'did-badge--verified' : 'did-badge--pending'}`}
            onClick={() => navigate(didVerified ? '/wallet' : '/did-auth')}
            style={{ cursor: 'pointer' }}
          >
            {didVerified ? '✓ DID Verified' : '인증이 필요해요'}
          </span>
        </div>
      </header>

      {/* 카테고리 아이콘 */}
      <div className="category-row">
        <button className="category-item" onClick={() => setCountrySheet(true)}>
          <img src={mapIcon} alt="국가" />
          <span>국가</span>
        </button>
        <button className="category-item" onClick={() => setCarTypeSheet(true)}>
          <img src={carIcon} alt="차종" />
          <span>차종</span>
        </button>
        <button className="category-item">
          <img src={companyIcon} alt="업체" />
          <span>업체</span>
        </button>
      </div>

      {/* 검색 폼 */}
      <div className="search-card">
        <button className="search-field" onClick={() => setCountrySheet(true)}>
          <span className="field-icon">📍</span>
          <span className={form.country ? 'field-value' : 'field-placeholder'}>
            {form.country || '픽업 국가명'}
          </span>
        </button>

        <button
          className="search-field"
          onClick={() => form.country && setAirportSheet(true)}
          style={{ opacity: form.country ? 1 : 0.6 }}
        >
          <span className="field-icon">📍</span>
          <span className={form.location ? 'field-value' : 'field-placeholder'}>
            {form.location || '픽업 위치'}
          </span>
        </button>

        <div className="date-row">
          <button className="search-field date-field" onClick={() => setDateModal('pickup')}>
            <span className="field-icon">📅</span>
            <div className="date-content">
              <span className="date-label">픽업 날짜</span>
              <span className={form.pickupDate ? 'field-value' : 'field-placeholder'}>
                {form.pickupDate || '날짜 선택'}
              </span>
            </div>
          </button>
          <div className="search-field time-field">
            <span className="date-label">시간</span>
            <input
              className="time-input"
              type="time"
              value={form.pickupTime}
              onChange={(e) => setForm((p) => ({ ...p, pickupTime: e.target.value }))}
            />
          </div>
        </div>

        <div className="date-row">
          <button className="search-field date-field" onClick={() => setDateModal('return')}>
            <span className="field-icon">📅</span>
            <div className="date-content">
              <span className="date-label">반납 날짜</span>
              <span className={form.returnDate ? 'field-value' : 'field-placeholder'}>
                {form.returnDate || '날짜 선택'}
              </span>
            </div>
          </button>
          <div className="search-field time-field">
            <span className="date-label">시간</span>
            <input
              className="time-input"
              type="time"
              value={form.returnTime}
              onChange={(e) => setForm((p) => ({ ...p, returnTime: e.target.value }))}
            />
          </div>
        </div>

        <button className="search-field" onClick={() => setCarTypeSheet(true)}>
          <span className="field-icon">🚗</span>
          <span className={form.carType ? 'field-value' : 'field-placeholder'}>
            {form.carType || '차량 종류'}
          </span>
        </button>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.showAll}
            onChange={(e) => setForm((p) => ({ ...p, showAll: e.target.checked }))}
          />
          <span>가능한 모든 차를 보고 싶어요</span>
        </label>

        <button className="btn btn-primary search-btn" onClick={handleSearch}>
          검색
        </button>
      </div>

      {/* 국가 선택 바텀시트 */}
      <BottomSheet open={countrySheet} onClose={() => { setCountrySheet(false); setCountrySearch('') }}>
        <h3 className="sheet-title">어느 나라에 여행가시나요?</h3>
        <div className="sheet-search">
          <span className="sheet-search-icon">🔍</span>
          <input
            className="sheet-input"
            placeholder="국가 검색"
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            autoFocus
          />
        </div>
        <button className="location-btn">
          <span className="location-icon">🎯</span>
          <span>내 위치</span>
        </button>
        <hr className="sheet-divider" />
        <ul className="sheet-list">
          {filteredCountries.map((c) => (
            <li key={c.name} className="sheet-list-item" onClick={() => selectCountry(c)}>
              <span className="list-icon">📍</span>
              <div>
                <p className="list-main">{c.name}</p>
                <p className="list-sub">{c.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* 공항 선택 바텀시트 */}
      <BottomSheet open={airportSheet} onClose={() => { setAirportSheet(false); setAirportSearch('') }}>
        <h3 className="sheet-title">어느 공항에서 픽업하나요?</h3>
        <div className="sheet-search">
          <span className="sheet-search-icon">🔍</span>
          <input
            className="sheet-input"
            placeholder="공항 검색"
            value={airportSearch}
            onChange={(e) => setAirportSearch(e.target.value)}
            autoFocus
          />
        </div>
        <button className="location-btn">
          <span className="location-icon">🎯</span>
          <span>내 위치</span>
        </button>
        <hr className="sheet-divider" />
        <ul className="sheet-list">
          {filteredAirports.map((a) => (
            <li key={a.name} className="sheet-list-item" onClick={() => selectAirport(a)}>
              <span className="list-icon">✈️</span>
              <div>
                <p className="list-main">{a.name}</p>
                <p className="list-sub">{a.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* 차종 선택 바텀시트 */}
      <BottomSheet open={carTypeSheet} onClose={() => setCarTypeSheet(false)}>
        <h3 className="sheet-title">차량 종류를 선택하세요</h3>
        <ul className="sheet-list">
          {CAR_TYPES.map((t) => (
            <li
              key={t}
              className={`sheet-list-item car-type-item${form.carType === t ? ' selected' : ''}`}
              onClick={() => { setForm((p) => ({ ...p, carType: t === '전체' ? '' : t })); setCarTypeSheet(false) }}
            >
              <span className="list-icon">🚗</span>
              <p className="list-main">{t}</p>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* 날짜 선택 모달 */}
      <DatePickerModal
        open={!!dateModal}
        label={dateModal === 'pickup' ? '픽업 날짜' : '반납 날짜'}
        onClose={() => setDateModal(null)}
        onSelect={selectDate}
      />

      <BottomNav />
    </div>
  )
}
