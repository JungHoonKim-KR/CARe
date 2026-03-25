import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import { getMyReservations } from '../../api/reservation'
import './ReservationListPage.css'

const STATUS_LABEL = {
  RESERVED:   { text: '예약완료', color: '#5B8DEF' },
  IN_USE:     { text: '이용중',   color: '#4CAF50' },
  AFTER_SCAN: { text: '스캔완료', color: '#888'    },
  COMPLETED:  { text: '반납완료', color: '#888'    },
  CANCELLED:  { text: '취소됨',   color: '#FF4D4F' },
}

const FILTERS = [
  { id: 'all',       label: '전체' },
  { id: 'reserved',  label: '예약완료' },
  { id: 'completed', label: '반납완료' },
  { id: 'disputed',  label: '분쟁중' },
]

function formatDate(dateStr) {
  if (!dateStr) return '--'
  const d = dateStr.split('T')[0]
  return d.replace(/-/g, '.')
}

function isDisputed(reservationId) {
  return localStorage.getItem(`disputePending_${reservationId}`) === 'true'
}

export default function ReservationListPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    getMyReservations()
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return reservations
    if (activeFilter === 'reserved') return reservations.filter(r => r.status === 'RESERVED')
    if (activeFilter === 'completed') return reservations.filter(r => r.status === 'COMPLETED')
    if (activeFilter === 'disputed') return reservations.filter(r => isDisputed(r.reservationId))
    return reservations
  }, [reservations, activeFilter])

  return (
    <div className="rl-page">
      <div className="rl-header">
        <button className="rl-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#111" />
          </svg>
        </button>
        <h1 className="rl-title">예약 내역</h1>
      </div>

      {/* 필터 탭 */}
      <div className="rl-filter-row">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`rl-filter-tab${activeFilter === f.id ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rl-body">
        {loading && <p className="rl-empty">불러오는 중...</p>}
        {!loading && filtered.length === 0 && (
          <p className="rl-empty">
            {activeFilter === 'all' ? '예약 내역이 없습니다.' :
             activeFilter === 'reserved' ? '예약완료 내역이 없습니다.' :
             activeFilter === 'completed' ? '반납완료 내역이 없습니다.' :
             '분쟁중인 내역이 없습니다.'}
          </p>
        )}
        {filtered.map((r) => {
          const disputed = isDisputed(r.reservationId)
          const status = disputed
            ? { text: '분쟁중', color: '#FF8800' }
            : (STATUS_LABEL[r.status] || { text: r.status, color: '#888' })
          return (
            <div
              key={r.reservationId}
              className={`rl-card${disputed ? ' rl-card-disputed' : ''}`}
              onClick={() => {
                if (disputed) {
                  navigate('/dispute', { state: { reservation: r, disputeId: localStorage.getItem(`disputeId_${r.reservationId}`) } })
                } else {
                  navigate('/my-car', { state: { reservation: r } })
                }
              }}
            >
              <div className="rl-card-top">
                <span className="rl-car-name">{r.brand} {r.modelName}</span>
                <span className="rl-status" style={{ color: status.color }}>{status.text}</span>
              </div>
              <p className="rl-plate">{r.plateNumber}</p>
              <div className="rl-dates">
                <span>{formatDate(r.pickupDate)}</span>
                <span className="rl-arrow">→</span>
                <span>{formatDate(r.returnDate)}</span>
              </div>
              <p className="rl-insurance">{r.insuranceName}</p>
              {disputed && (
                <div className="rl-dispute-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4M12 17h.01" stroke="#FF8800" strokeWidth="2.2" strokeLinecap="round"/>
                    <path d="M12 2L2 20h20L12 2z" stroke="#FF8800" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  <span>분쟁이 접수되었습니다. 확인해주세요.</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
