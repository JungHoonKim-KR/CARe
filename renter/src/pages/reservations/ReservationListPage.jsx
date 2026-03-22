import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import { getMyReservations } from '../../api/reservation'
import './ReservationListPage.css'

const STATUS_LABEL = {
  RESERVED:   { text: '예약완료', color: '#5B8DEF' },
  IN_USE:     { text: '이용중',   color: '#4CAF50' },
  AFTER_SCAN: { text: '반납완료', color: '#888'    },
  CANCELLED:  { text: '취소됨',   color: '#FF4D4F' },
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  const d = dateStr.split('T')[0]
  return d.replace(/-/g, '.')
}

export default function ReservationListPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyReservations()
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false))
  }, [])

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

      <div className="rl-body">
        {loading && <p className="rl-empty">불러오는 중...</p>}
        {!loading && reservations.length === 0 && (
          <p className="rl-empty">예약 내역이 없습니다.</p>
        )}
        {reservations.map((r) => {
          const status = STATUS_LABEL[r.status] || { text: r.status, color: '#888' }
          return (
            <div
              key={r.reservationId}
              className="rl-card"
              onClick={() => navigate('/my-car', { state: { reservation: r } })}
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
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
