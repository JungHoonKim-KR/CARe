import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BottomNav from '../../components/BottomNav'
import { getMyReservations } from '../../api/reservation'
import '../my-car/MyCarPage.css'
import './ReservationDetailPage.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const STATUS_LABEL = {
  RESERVED:  '예약 완료',
  IN_USE:    '이용 중',
  COMPLETED: '반납 완료',
  CANCELLED: '취소됨',
}

function parseDate(val) {
  if (!val) return null
  if (Array.isArray(val)) return new Date(val[0], val[1] - 1, val[2])
  const d = new Date(val)
  return isNaN(d) ? null : d
}

function formatDateLabel(dateStr) {
  if (!dateStr) return null
  const d = parseDate(dateStr)
  if (!d) return null
  return { month: d.getMonth() + 1, day: d.getDate(), weekday: WEEKDAYS[d.getDay()] }
}

function getPickupStatus(reservation) {
  if (!reservation?.startDate || !reservation?.endDate) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = parseDate(reservation.startDate); if (!start) return null; start.setHours(0,0,0,0)
  const end   = parseDate(reservation.endDate);   if (!end)   return null; end.setHours(0,0,0,0)

  const msPerDay = 1000 * 60 * 60 * 24
  const daysToStart   = Math.round((start - today) / msPerDay)
  const daysToEnd     = Math.round((end - today) / msPerDay)
  const totalRental   = Math.round((end - start) / msPerDay)
  const elapsedRental = Math.round((today - start) / msPerDay)

  if (daysToStart > 0)  return { type: 'before', label: `픽업 D-${daysToStart}`, color: '#F7A633', progress: 0 }
  if (daysToStart === 0) return { type: 'today',  label: '오늘 픽업 가능!',       color: '#4CAF50', progress: 0 }
  if (daysToEnd > 0) {
    const progress = totalRental > 0 ? Math.min(elapsedRental / totalRental, 1) : 0
    return { type: 'active', label: `반납 D-${daysToEnd}`, color: '#5B8DEF', progress }
  }
  return { type: 'return', label: '반납일', color: '#FF4D4F', progress: 1 }
}

export default function ReservationDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [reservation, setReservation] = useState(state?.reservation || null)
  const [loading, setLoading] = useState(!state?.reservation)

  useEffect(() => {
    if (state?.reservation) return
    getMyReservations()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        const found = list.find(r => r.reservationId === state?.reservationId) || null
        setReservation(found)
      })
      .catch(() => setReservation(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mc-page">
        <div className="rd-header">
          <button className="rd-back-btn" onClick={() => navigate('/reservations')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="rd-header-title">예약 상세</span>
        </div>
        <div className="mc-loading"><div className="mc-spinner" /></div>
        <BottomNav />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="mc-page">
        <div className="rd-header">
          <button className="rd-back-btn" onClick={() => navigate('/reservations')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="rd-header-title">예약 상세</span>
        </div>
        <div className="mc-empty">
          <p className="mc-empty-title">예약 정보를 찾을 수 없어요</p>
          <button className="mc-empty-btn" onClick={() => navigate('/reservations')}>예약 목록으로</button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const isCompleted = reservation.status === 'COMPLETED'
  const carName = reservation.brand && reservation.modelName
    ? `${reservation.brand} ${reservation.modelName}`
    : reservation.carName || '차량 정보 없음'

  const rawPickup = reservation.pickupDate || reservation.startDate || null
  const rawReturn = reservation.returnDate || reservation.endDate   || null

  const splitDT = (val) => {
    if (!val) return { date: null, time: null }
    if (Array.isArray(val)) {
      const [y, mo, d, h = 0, m = 0] = val
      return {
        date: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
        time: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
      }
    }
    const [date, timePart] = String(val).split('T')
    return { date, time: timePart ? timePart.slice(0, 5) : null }
  }

  const { date: startDate, time: startTime } = splitDT(rawPickup)
  const { date: endDate,   time: endTime   } = splitDT(rawReturn)

  const pickupStatus = getPickupStatus({ ...reservation, startDate, endDate })
  const startLabel   = formatDateLabel(startDate)
  const endLabel     = formatDateLabel(endDate)

  return (
    <div className="mc-page">
      {/* 뒤로가기 헤더 */}
      <div className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate('/reservations')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="rd-header-title">예약 상세</span>
      </div>

      <div className="mc-scroll">
        {/* 차량 헤더 */}
        <div className="mc-car-header">
          <div className="mc-plate-row">
            <span className="mc-plate">{reservation.plateNumber}</span>
            <span className={`mc-nft-badge${isCompleted ? ' completed' : ''}`}>
              {STATUS_LABEL[reservation.status] || reservation.status}
            </span>
          </div>
          <h1 className="mc-car-name">{carName}</h1>
        </div>

        {/* 차량 이미지 */}
        <div className="mc-car-image-wrap">
          <div className="mc-car-emoji-wrap">
            <span className="mc-car-emoji">🚗</span>
          </div>
        </div>

        {/* 대여 일정 카드 */}
        <div className="mc-schedule-card">
          <p className="mc-schedule-title">{t('myCar.schedule')}</p>
          <div className="mc-schedule-row">
            <div className="mc-schedule-col">
              <span className="mc-schedule-tag pickup">{t('myCar.pickup')}</span>
              <p className="mc-schedule-date">
                {startLabel ? `${startLabel.month}월 ${startLabel.day}일` : '--'}
                {startLabel && <span className="mc-schedule-weekday"> ({startLabel.weekday})</span>}
              </p>
              {startTime && <p className="mc-schedule-time">{startTime}</p>}
            </div>
            <div className="mc-schedule-arrow">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="#F7A633" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="mc-schedule-col">
              <span className="mc-schedule-tag return">{t('myCar.return')}</span>
              <p className="mc-schedule-date">
                {endLabel ? `${endLabel.month}월 ${endLabel.day}일` : '--'}
                {endLabel && <span className="mc-schedule-weekday"> ({endLabel.weekday})</span>}
              </p>
              {endTime && <p className="mc-schedule-time">{endTime}</p>}
            </div>
          </div>

          {pickupStatus && (
            <div className="mc-schedule-progress-wrap">
              <div className="mc-schedule-bar-bg">
                <div
                  className="mc-schedule-bar-fill"
                  style={{
                    width: pickupStatus.type === 'active' ? `${pickupStatus.progress * 100}%` :
                           pickupStatus.type === 'return' ? '100%' : '0%',
                    background: pickupStatus.color,
                  }}
                />
              </div>
              <span className="mc-schedule-dday" style={{ color: pickupStatus.color }}>
                {pickupStatus.label}
              </span>
            </div>
          )}

          <div className="mc-schedule-location">
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#F7A633"/>
            </svg>
            <span>{reservation.insuranceName} | {reservation.plateNumber}</span>
          </div>
        </div>

        {/* 반납 완료 표시 */}
        {isCompleted && (
          <div className="mc-action-card mc-completed-card">
            <p className="mc-action-card-title">{t('myCar.returnCompleted')}</p>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>

      <BottomNav />
    </div>
  )
}
