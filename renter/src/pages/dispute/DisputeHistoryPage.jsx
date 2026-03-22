import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import './DisputeHistoryPage.css'

const PARTS = [
  { id: 'all',   label: '전체' },
  { id: 'FRONT', label: '전면' },
  { id: 'REAR',  label: '후면' },
  { id: 'LEFT',  label: '좌측' },
  { id: 'RIGHT', label: '우측' },
]

const MOCK_HISTORY = [
  { id: 14, date: '2025년 3월 13일 11:57 am', desc: '우측 도어 패널 스크래치',    location: 'RIGHT', hasPhoto: true,  isNew: true  },
  { id: 13, date: '2025년 3월 11일 09:30 am', desc: '전면 범퍼 경미한 흠집',     location: 'FRONT', hasPhoto: true,  isNew: false },
  { id: 12, date: '2025년 3월 10일 02:15 pm', desc: '좌측 사이드 미러 긁힘',     location: 'LEFT',  hasPhoto: false, isNew: false },
  { id: 11, date: '2025년 3월 08일 11:00 am', desc: '후면 범퍼 미세 흠집',       location: 'REAR',  hasPhoto: false, isNew: false },
  { id: 10, date: '2025년 3월 07일 04:22 pm', desc: '전면 유리 소형 크랙',       location: 'FRONT', hasPhoto: true,  isNew: false },
  { id:  9, date: '2025년 3월 05일 01:10 pm', desc: '우측 휀더 경미한 스크래치', location: 'RIGHT', hasPhoto: false, isNew: false },
  { id:  8, date: '2025년 3월 03일 03:45 pm', desc: '좌측 도어 하단 긁힘',       location: 'LEFT',  hasPhoto: true,  isNew: false },
]

export default function DisputeHistoryPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const reservation = state?.reservation

  const [query, setQuery] = useState('')
  const [activePart, setActivePart] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [submitted, setSubmitted] = useState(false)

  const filtered = useMemo(() => {
    return MOCK_HISTORY.filter(item => {
      const matchPart = activePart === 'all' || item.location === activePart
      const matchQuery = !query || item.desc.includes(query) || item.date.includes(query)
      return matchPart && matchQuery
    })
  }, [activePart, query])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      if (reservation?.reservationId) {
        localStorage.removeItem(`disputePending_${reservation.reservationId}`)
        localStorage.removeItem(`disputeDate_${reservation.reservationId}`)
      }
      navigate('/my-car')
    }, 2200)
  }

  if (submitted) return (
    <div className="dh-submit-page">
      <div className="dh-submit-icon">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="dh-submit-title">증거를 제출했어요!</h2>
      <p className="dh-submit-desc">
        선택한 {selected.size}건의 흠집 기록을<br/>
        임대인에게 전송했어요.<br/>
        검토 후 분쟁 결과를 알려드려요.
      </p>
    </div>
  )

  return (
    <div className="dh-page">
      {/* 헤더 */}
      <header className="dh-header">
        <button className="dh-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img src={careLogo} alt="CARe" className="dh-logo" />
        <div style={{ width: 38 }} />
      </header>

      <div className="dh-scroll">
        {/* 타이틀 */}
        <div className="dh-title-area">
          <h1 className="dh-title">이전 흠집 기록</h1>
          <p className="dh-subtitle">
            반납 전부터 있던 흠집을 선택해<br/>임대인에게 증거로 제출하세요.
          </p>
        </div>

        {/* 새 흠집 안내 */}
        <div className="dh-new-alert">
          <div className="dh-new-alert-dot" />
          <p className="dh-new-alert-text">
            <strong>14번째 흠집</strong>은 이전 기록에 없던 새 흠집이에요
          </p>
        </div>

        {/* 검색 */}
        <div className="dh-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#bbb" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className="dh-search-input"
            placeholder="흠집 내용, 날짜로 검색"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="dh-search-clear" onClick={() => setQuery('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* 부위별 필터 탭 */}
        <div className="dh-filter-row">
          {PARTS.map(part => (
            <button
              key={part.id}
              className={`dh-filter-tab${activePart === part.id ? ' active' : ''}`}
              onClick={() => setActivePart(part.id)}
            >
              {part.label}
            </button>
          ))}
        </div>

        {/* 결과 없음 */}
        {filtered.length === 0 && (
          <div className="dh-empty">
            <p>검색 결과가 없어요</p>
          </div>
        )}

        {/* 아코디언 목록 */}
        <div className="dh-list">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`dh-item${item.isNew ? ' dh-item-new' : ''}${selected.has(item.id) ? ' dh-item-selected' : ''}`}
            >
              <div className="dh-item-header">
                {/* 체크박스 (새 흠집은 선택 불가) */}
                {!item.isNew ? (
                  <button
                    className={`dh-checkbox${selected.has(item.id) ? ' checked' : ''}`}
                    onClick={() => toggle(item.id)}
                  >
                    {selected.has(item.id) && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ) : (
                  <div className="dh-checkbox-placeholder" />
                )}

                {/* 텍스트 클릭 → 아코디언 */}
                <button
                  className="dh-item-info"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <div className="dh-item-top">
                    <span className="dh-item-num">{item.id}번째 흠집</span>
                    {item.isNew && <span className="dh-new-badge">NEW</span>}
                    <span className={`dh-location-badge loc-${item.location.toLowerCase()}`}>
                      {PARTS.find(p => p.id === item.location)?.label}
                    </span>
                  </div>
                  <div className="dh-item-bottom">
                    <span className="dh-item-desc">{item.desc}</span>
                    <span className="dh-item-date">{item.date}</span>
                  </div>
                </button>

                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  className={`dh-chevron${expanded === item.id ? ' open' : ''}`}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <path d="M6 9l6 6 6-6" stroke="#ccc" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* 아코디언 본문 */}
              {expanded === item.id && (
                <div className="dh-item-body">
                  {item.hasPhoto ? (
                    <>
                      <div className="dh-photo-placeholder">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="5" width="18" height="14" rx="2"
                            stroke="#ddd" strokeWidth="1.5"/>
                          <circle cx="12" cy="12" r="3" stroke="#ddd" strokeWidth="1.5"/>
                          <circle cx="17.5" cy="7.5" r="1" fill="#ddd"/>
                        </svg>
                        <p className="dh-photo-label">흠집 사진</p>
                      </div>
                      <div className="dh-blockchain-row">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="#F7A633"
                            strokeWidth="2" strokeLinejoin="round"/>
                          <path d="M3 17L12 22L21 17M3 12L12 17L21 12"
                            stroke="#F7A633" strokeWidth="2" strokeLinejoin="round"/>
                        </svg>
                        <span className="dh-blockchain-text">검증 완료</span>
                      </div>
                    </>
                  ) : (
                    <p className="dh-no-photo">사진 기록 없음</p>
                  )}
                  {!item.isNew && (
                    <button
                      className={`dh-select-btn${selected.has(item.id) ? ' selected' : ''}`}
                      onClick={() => toggle(item.id)}
                    >
                      {selected.has(item.id) ? '✓ 증거로 선택됨' : '증거로 선택하기'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ height: 140 }} />
      </div>

      {/* 하단 영역 */}
      <div className="dh-footer">
        {selected.size > 0 ? (
          <button className="dh-submit-btn" onClick={handleSubmit}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {selected.size}건 선택 · 증거로 제출하기
          </button>
        ) : (
          <button className="dh-main-btn" onClick={() => {
            if (reservation?.reservationId) {
              localStorage.removeItem(`disputePending_${reservation.reservationId}`)
              localStorage.removeItem(`disputeDate_${reservation.reservationId}`)
            }
            navigate('/my-car')
          }}>
            메인으로
          </button>
        )}
      </div>
    </div>
  )
}
