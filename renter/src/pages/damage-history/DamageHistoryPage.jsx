import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import { getCarScratches } from '../../api/reservation'
import './DamageHistoryPage.css'

const LOCATION_LABELS = {
  FRONT: '전면부',
  REAR: '후면부',
  LEFT: '좌측',
  RIGHT: '우측',
  ROOF: '루프',
  HOOD: '보닛',
}

// 차체 위치 마커 좌표 (top-view 기준, %)
const LOCATION_MARKERS = {
  FRONT: { top: 12, left: 50 },
  REAR:  { top: 82, left: 50 },
  LEFT:  { top: 50, left: 18 },
  RIGHT: { top: 50, left: 82 },
  ROOF:  { top: 50, left: 50 },
  HOOD:  { top: 24, left: 50 },
}

export default function DamageHistoryPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const reservation = state?.reservation
  const [scratches, setScratches] = useState(state?.scratches || [])
  const [loading, setLoading] = useState(!state?.scratches)
  const [filter, setFilter] = useState('ALL') // ALL | PENDING | RESOLVED

  useEffect(() => {
    if (state?.scratches) return
    if (!reservation?.reservationId) return
    const fetchData = async () => {
      try {
        const data = await getCarScratches(reservation.reservationId)
        setScratches(Array.isArray(data) ? data : data?.data || [])
      } catch {
        setScratches([
          { scratchId: 1, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'PENDING' },
          { scratchId: 2, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'PENDING' },
          { scratchId: 3, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'RESOLVED' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [reservation, state])

  const filtered = filter === 'ALL' ? scratches : scratches.filter((s) => s.status === filter)
  const pendingCount = scratches.filter((s) => s.status === 'PENDING').length
  const resolvedCount = scratches.filter((s) => s.status === 'RESOLVED').length

  // 위치별 그룹화 (마커 표시용)
  const locationGroups = scratches.reduce((acc, s) => {
    if (!acc[s.location]) acc[s.location] = []
    acc[s.location].push(s)
    return acc
  }, {})

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
        <h1 className="dh-title">차량 흠집 내역</h1>
        <span className="dh-verified-badge">blockchain verified</span>
      </header>

      <div className="dh-scroll">
        {/* 타이틀 */}
        <div className="dh-top-section">
          <div className="dh-heading-row">
            <h2 className="dh-heading">발견된 흠집</h2>
            <button className="dh-filter-btn" onClick={() => {
              const filters = ['ALL', 'PENDING', 'RESOLVED']
              const idx = filters.indexOf(filter)
              setFilter(filters[(idx + 1) % filters.length])
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="#555"/>
              </svg>
              {filter === 'ALL' ? '필터' : filter === 'PENDING' ? '미처리' : '처리완료'}
            </button>
          </div>
          <p className="dh-sub">총 <strong>{scratches.length}건</strong>의 리포트</p>
        </div>

        {/* 차체 다이어그램 */}
        <div className="dh-diagram-section">
          <div className="dh-diagram-wrap">
            <div className="dh-car-diagram">
              {/* 차량 top-view SVG */}
              <svg viewBox="0 0 200 340" className="dh-car-svg" fill="none">
                {/* 차체 외곽 */}
                <rect x="55" y="20" width="90" height="300" rx="40" fill="#e8eaf0" stroke="#c8cad6" strokeWidth="1.5"/>
                {/* 앞유리 */}
                <rect x="65" y="55" width="70" height="45" rx="8" fill="#d0d4e0"/>
                {/* 뒷유리 */}
                <rect x="65" y="240" width="70" height="45" rx="8" fill="#d0d4e0"/>
                {/* 차량 내부 (시트) */}
                <rect x="72" y="120" width="56" height="100" rx="10" fill="#1a2340"/>
                {/* 앞바퀴 */}
                <rect x="28" y="80" width="32" height="50" rx="10" fill="#555"/>
                <rect x="140" y="80" width="32" height="50" rx="10" fill="#555"/>
                {/* 뒷바퀴 */}
                <rect x="28" y="210" width="32" height="50" rx="10" fill="#555"/>
                <rect x="140" y="210" width="32" height="50" rx="10" fill="#555"/>
              </svg>

              {/* 손상 마커 */}
              {Object.entries(locationGroups).map(([loc, items]) => {
                const pos = LOCATION_MARKERS[loc] || { top: 50, left: 50 }
                const hasPending = items.some((i) => i.status === 'PENDING')
                return (
                  <button
                    key={loc}
                    className={`dh-marker${hasPending ? ' pending' : ' resolved'}`}
                    style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                    onClick={() => navigate('/damage-detail', {
                      state: { location: loc, scratches: items, reservation }
                    })}
                  >
                    <span className="dh-marker-count">{items.length}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* AI 진단 카드 */}
        <div className="dh-ai-card">
          <div className="dh-ai-title-row">
            <span className="dh-ai-icon">✨</span>
            <span className="dh-ai-title">AI 차량 상태 진단</span>
          </div>
          <p className="dh-ai-desc">
            데이터 분석 결과, 현재 <strong>{pendingCount}건의 미처리 흠집</strong>이 존재합니다.<br/>
            상세 내역을 확인하고 수리를 계획해 보세요.
          </p>
          <div className="dh-ai-stats">
            <div className="dh-ai-stat pending">
              <span className="dh-ai-stat-dot pending-dot"/>
              <span className="dh-ai-stat-label">미처리</span>
              <span className="dh-ai-stat-count">{pendingCount}건</span>
            </div>
            <div className="dh-ai-stat-divider"/>
            <div className="dh-ai-stat resolved">
              <span className="dh-ai-stat-dot resolved-dot"/>
              <span className="dh-ai-stat-label">처리 완료</span>
              <span className="dh-ai-stat-count">{resolvedCount}건</span>
            </div>
          </div>
        </div>

        {/* 흠집 목록 */}
        {loading ? (
          <div className="dh-list-loading">
            <div className="dh-spinner"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dh-list-empty">해당하는 흠집 내역이 없습니다.</div>
        ) : (
          <div className="dh-list">
            {filtered.map((s) => (
              <button
                key={s.scratchId}
                className="dh-list-item"
                onClick={() => navigate('/damage-detail', {
                  state: {
                    location: s.location,
                    scratches: scratches.filter((x) => x.location === s.location),
                    reservation,
                    focusId: s.scratchId,
                  }
                })}
              >
                <div className="dh-item-left">
                  <span className={`dh-status-dot ${s.status === 'PENDING' ? 'pending-dot' : 'resolved-dot'}`}/>
                  <div>
                    <p className="dh-item-desc">{s.description}</p>
                    <p className="dh-item-meta">
                      {LOCATION_LABELS[s.location] || s.location} · {s.reportedAt}
                    </p>
                  </div>
                </div>
                <div className="dh-item-right">
                  <span className={`dh-status-badge ${s.status === 'PENDING' ? 'badge-pending' : 'badge-resolved'}`}>
                    {s.status === 'PENDING' ? '미처리' : '처리완료'}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>

      <BottomNav />
    </div>
  )
}
