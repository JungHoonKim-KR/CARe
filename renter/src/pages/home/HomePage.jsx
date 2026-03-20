import { useState, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t, i18n } = useTranslation()

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

  const CAR_TYPES = [
    { key: '', label: t('home.carTypeAll') },
    { key: '소형', label: t('home.carTypeSmall') },
    { key: '중형', label: t('home.carTypeMedium') },
    { key: '대형', label: t('home.carTypeLarge') },
    { key: 'SUV', label: 'SUV' },
    { key: '밴', label: t('home.carTypeVan') },
    { key: '럭셔리', label: t('home.carTypeLuxury') },
  ]

  const LANG_LABELS = { ko: '한국어', en: 'English', zh: '中文', ja: '日本語', fr: 'Français' }

  const [showDidAlert, setShowDidAlert] = useState(false)
  const [countrySheet, setCountrySheet] = useState(false)
  const [airportSheet, setAirportSheet] = useState(false)
  const [carTypeSheet, setCarTypeSheet] = useState(false)
  const [dateModal, setDateModal] = useState(null)
  const [countrySearch, setCountrySearch] = useState('')
  const [airportSearch, setAirportSearch] = useState('')

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('did_alert_shown')
    if (!didVerified && !alreadyShown) {
      const timer = setTimeout(() => {
        setShowDidAlert(true)
        sessionStorage.setItem('did_alert_shown', 'true')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

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

  const carTypeLabel = CAR_TYPES.find((c) => c.key === form.carType)?.label || ''

  return (
    <div className="home-container">
      {/* DID 미인증 알림 */}
      {showDidAlert && (
        <div className="did-alert-overlay" onClick={() => setShowDidAlert(false)}>
          <div className="did-alert-box" onClick={(e) => e.stopPropagation()}>
            <div className="did-alert-icon">🪪</div>
            <p className="did-alert-title">{t('home.didAlert.title')}</p>
            <p className="did-alert-desc">{t('home.didAlert.desc').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}</p>
            <div className="did-alert-btns">
              <button
                className="did-alert-confirm"
                onClick={() => { setShowDidAlert(false); navigate('/did-auth') }}
              >
                {t('home.didAlert.confirm')}
              </button>
              <button
                className="did-alert-cancel"
                onClick={() => setShowDidAlert(false)}
              >
                {t('home.didAlert.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="home-header">
        <img src={careLogo} alt="CARe" className="home-logo" />
        <div className="home-header-right">
          <button className="lang-btn" onClick={() => navigate('/language')}>
            <span className="lang-icon">🌐</span>
            <span>{LANG_LABELS[i18n.language] || i18n.language}</span>
          </button>
          <span
            className={`did-badge ${didVerified ? 'did-badge--verified' : 'did-badge--pending'}`}
            onClick={() => navigate(didVerified ? '/wallet' : '/did-auth')}
            style={{ cursor: 'pointer' }}
          >
            {didVerified ? 'DID' : t('home.unverified')}
          </span>
        </div>
      </header>

      {/* 카테고리 아이콘 */}
      <div className="category-row">
        <button className="category-item" onClick={() => setCountrySheet(true)}>
          <img src={mapIcon} alt={t('home.country')} />
          <span>{t('home.country')}</span>
        </button>
        <button className="category-item" onClick={() => setCarTypeSheet(true)}>
          <img src={carIcon} alt={t('home.carKind')} />
          <span>{t('home.carKind')}</span>
        </button>
        <button className="category-item">
          <img src={companyIcon} alt={t('home.company')} />
          <span>{t('home.company')}</span>
        </button>
      </div>

      {/* 검색 폼 */}
      <div className="search-card">
        <button className="search-field" onClick={() => setCountrySheet(true)}>
          <span className="field-icon">📍</span>
          <span className={form.country ? 'field-value' : 'field-placeholder'}>
            {form.country || t('home.pickupCountry')}
          </span>
        </button>

        <button
          className="search-field"
          onClick={() => form.country && setAirportSheet(true)}
          style={{ opacity: form.country ? 1 : 0.6 }}
        >
          <span className="field-icon">📍</span>
          <span className={form.location ? 'field-value' : 'field-placeholder'}>
            {form.location || t('home.pickupLocation')}
          </span>
        </button>

        <div className="date-row">
          <button className="search-field date-field" onClick={() => setDateModal('pickup')}>
            <span className="field-icon">📅</span>
            <div className="date-content">
              <span className="date-label">{t('home.pickupDate')}</span>
              <span className={form.pickupDate ? 'field-value' : 'field-placeholder'}>
                {form.pickupDate || t('home.selectDate')}
              </span>
            </div>
          </button>
          <div className="search-field time-field">
            <span className="date-label">{t('home.time')}</span>
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
              <span className="date-label">{t('home.returnDate')}</span>
              <span className={form.returnDate ? 'field-value' : 'field-placeholder'}>
                {form.returnDate || t('home.selectDate')}
              </span>
            </div>
          </button>
          <div className="search-field time-field">
            <span className="date-label">{t('home.time')}</span>
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
            {carTypeLabel || t('home.carType')}
          </span>
        </button>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.showAll}
            onChange={(e) => setForm((p) => ({ ...p, showAll: e.target.checked }))}
          />
          <span>{t('home.showAll')}</span>
        </label>

        <button className="btn btn-primary search-btn" onClick={handleSearch}>
          {t('home.search')}
        </button>
      </div>

      {/* 국가 선택 바텀시트 */}
      <BottomSheet open={countrySheet} onClose={() => { setCountrySheet(false); setCountrySearch('') }}>
        <h3 className="sheet-title">{t('home.countrySheet')}</h3>
        <div className="sheet-search">
          <span className="sheet-search-icon">🔍</span>
          <input
            className="sheet-input"
            placeholder={t('home.searchCountry')}
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            autoFocus
          />
        </div>
        <button className="location-btn">
          <span className="location-icon">🎯</span>
          <span>{t('home.myLocation')}</span>
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
        <h3 className="sheet-title">{t('home.airportSheet')}</h3>
        <div className="sheet-search">
          <span className="sheet-search-icon">🔍</span>
          <input
            className="sheet-input"
            placeholder={t('home.searchAirport')}
            value={airportSearch}
            onChange={(e) => setAirportSearch(e.target.value)}
            autoFocus
          />
        </div>
        <button className="location-btn">
          <span className="location-icon">🎯</span>
          <span>{t('home.myLocation')}</span>
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
        <h3 className="sheet-title">{t('home.carTypeSheet')}</h3>
        <ul className="sheet-list">
          {CAR_TYPES.map((item) => (
            <li
              key={item.key}
              className={`sheet-list-item car-type-item${form.carType === item.key ? ' selected' : ''}`}
              onClick={() => { setForm((p) => ({ ...p, carType: item.key })); setCarTypeSheet(false) }}
            >
              <span className="list-icon">🚗</span>
              <p className="list-main">{item.label}</p>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* 날짜 선택 모달 */}
      <DatePickerModal
        open={!!dateModal}
        label={dateModal === 'pickup' ? t('home.pickupDate') : t('home.returnDate')}
        onClose={() => setDateModal(null)}
        onSelect={selectDate}
      />

      <BottomNav />
    </div>
  )
}
