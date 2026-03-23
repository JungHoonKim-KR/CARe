import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import carIcon from '../../assets/car_icon.png'
import BottomNav from '../../components/BottomNav'
import { getMyReservations } from '../../api/reservation'
import './MyCarPage.css'

const MOCK_RESERVATION = {
  reservationId: 1,
  carId: 101,
  carName: 'GENESIS GV70',
  plateNumber: '123가4567',
  nftTokenId: 231,
  carImageUrl: null,
  batteryLevel: 100,
  drivingRange: 78,
  status: 'ACTIVE',
  startDate: '2026-03-15',
  startTime: '09:00',
  endDate: '2026-03-20',
  endTime: '18:00',
  pickupLocation: '인천국제공항',
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function parseDate(val) {
  if (!val) return null
  // 배열 형태 [2026, 3, 15] 처리
  if (Array.isArray(val)) return new Date(val[0], val[1] - 1, val[2])
  // 문자열 "2026-03-15" 처리
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = parseDate(reservation.startDate)
  if (!start) return null
  start.setHours(0, 0, 0, 0)
  const end = parseDate(reservation.endDate)
  if (!end) return null
  end.setHours(0, 0, 0, 0)

  const msPerDay = 1000 * 60 * 60 * 24
  const daysToStart = Math.round((start - today) / msPerDay)
  const daysToEnd   = Math.round((end - today) / msPerDay)
  const totalRental = Math.round((end - start) / msPerDay)
  const elapsedRental = Math.round((today - start) / msPerDay)

  if (daysToStart > 0) {
    return { type: 'before', label: `픽업 D-${daysToStart}`, color: '#F7A633', progress: 0 }
  } else if (daysToStart === 0) {
    return { type: 'today', label: '오늘 픽업 가능!', color: '#4CAF50', progress: 0 }
  } else if (daysToEnd > 0) {
    const progress = totalRental > 0 ? Math.min(elapsedRental / totalRental, 1) : 0
    return { type: 'active', label: `반납 D-${daysToEnd}`, color: '#5B8DEF', progress }
  } else {
    return { type: 'return', label: '반납일', color: '#FF4D4F', progress: 1 }
  }
}

export default function MyCarPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [reservation, setReservation] = useState(state?.reservation || null)
  const [loading, setLoading] = useState(!state?.reservation)
  const [showDisputeModal, setShowDisputeModal] = useState(false)

  useEffect(() => {
    if (state?.reservation) return
    const fetchData = async () => {
      try {
        const data = await getMyReservations()
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        const sorted = [...list].sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        const active = sorted.find((r) => r.status === 'IN_USE')
          || sorted.find((r) => r.status === 'RESERVED')
        if (active) {
          setReservation(active)
          const pending = localStorage.getItem(`disputePending_${active.reservationId}`) === 'true'
          if (pending) setShowDisputeModal(true)
        } else {
          setReservation(null)
        }
      } catch {
        setReservation(MOCK_RESERVATION)
        const pending = localStorage.getItem(`disputePending_${MOCK_RESERVATION.reservationId}`) === 'true'
        if (pending) setShowDisputeModal(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="mc-page">
        <div className="mc-loading">
          <div className="mc-spinner" />
          <p>불러오는 중...</p>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="mc-page">
        <div className="mc-empty">
          <img src={carIcon} alt="차량 없음" className="mc-empty-icon" />
          <p className="mc-empty-title">예약한 차량이 없어요</p>
          <p className="mc-empty-desc">차량을 검색해서 첫 렌터카를 예약해보세요!</p>
          <button className="mc-empty-btn" onClick={() => navigate('/home')}>
            차량 검색하기
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const crackDone    = reservation
    ? localStorage.getItem(`crackDone_${reservation.reservationId}`) === 'true'
    : false
  const faceAuthDone = reservation
    ? localStorage.getItem(`faceAuthDone_${reservation.reservationId}`) === 'true'
    : false
  const pickupReady  = faceAuthDone && crackDone

  const rawPickup = reservation.pickupDate || reservation.startDate || null
  const rawReturn = reservation.returnDate || reservation.endDate   || null

  // "2026-03-15T10:00:00" → 날짜/시간 분리
  const splitDT = (val) => {
    if (!val) return { date: null, time: null }
    if (Array.isArray(val)) {
      const [y, mo, d, h = 0, m = 0] = val
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      return { date: `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`, time: `${hh}:${mm}` }
    }
    const [date, timePart] = String(val).split('T')
    const time = timePart ? timePart.slice(0, 5) : null
    return { date, time }
  }

  const { date: startDate, time: startTime } = splitDT(rawPickup)
  const { date: endDate,   time: endTime   } = splitDT(rawReturn)

  const pickupStatus = getPickupStatus({ ...reservation, startDate, endDate })
  const startLabel = formatDateLabel(startDate)
  const endLabel   = formatDateLabel(endDate)

  // 반납 버튼: 픽업일 당일 이후부터 활성화
  const today = new Date(); today.setHours(0,0,0,0)
  const returnActive = startDate ? new Date(startDate) <= today : false
  const carName    = reservation.brand && reservation.modelName
    ? `${reservation.brand} ${reservation.modelName}`
    : reservation.carName || '차량 정보 없음'

  return (
    <div className="mc-page">
      <div className="mc-scroll">
        {/* 차량 헤더 */}
        <div className="mc-car-header">
          <div className="mc-plate-row">
            <span className="mc-plate">{reservation.plateNumber}</span>
            <span className="mc-nft-badge">{reservation.status}</span>
          </div>
          <h1 className="mc-car-name">{carName}</h1>
        </div>

        {/* 차량 이미지 */}
        <div className="mc-car-image-wrap">
            <div className="mc-car-emoji-wrap">
            <span className="mc-car-emoji">🚗</span>
          </div>
        </div>

        {/* 배터리 & 주행거리 */}
        {(reservation.batteryLevel != null || reservation.drivingRange != null) && (
          <div className="mc-stats-card">
            <div className="mc-stat">
              <p className="mc-stat-label">배터리</p>
              <p className="mc-stat-value">{reservation.batteryLevel ?? '-'}%</p>
            </div>
            <div className="mc-stat-divider" />
            <div className="mc-stat">
              <p className="mc-stat-label">주행 가능 거리</p>
              <p className="mc-stat-value">{reservation.drivingRange ?? '-'}km</p>
            </div>
          </div>
        )}

        {/* 대여 일정 카드 */}
        <div className="mc-schedule-card">
          <p className="mc-schedule-title">대여 일정</p>
          <div className="mc-schedule-row">
            <div className="mc-schedule-col">
              <span className="mc-schedule-tag pickup">픽업</span>
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
              <span className="mc-schedule-tag return">반납</span>
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

        {/* 차량 외관 촬영 카드 */}
        <div className="mc-action-card">
          <p className="mc-action-card-title">차량 외관 촬영</p>
          <div className="mc-action-row">
            <button
              className="mc-action-btn mc-shoot-btn"
              onClick={() => navigate('/return-guide', { state: { reservation, logType: 'BEFORE' } })}
            >
              <div className="mc-action-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                    stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="mc-action-btn-label">픽업 전 촬영</span>
              <span className="mc-action-btn-sub">탑승 전 외관 기록</span>
            </button>
            <button
              className="mc-action-btn mc-return-btn"
              onClick={() => navigate('/return-guide', { state: { reservation } })}
            >
              <div className="mc-action-btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 14l-4-4 4-4" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 10h11a4 4 0 010 8h-1" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round"/>
                </svg>
              </div>
              <span className="mc-action-btn-label">반납하기</span>
              <span className="mc-action-btn-sub">반납 전 외관 촬영</span>
            </button>
          </div>
        </div>

        <div style={{ height: 130 }} />
      </div>

      {/* 하단 고정 - Smart Key + 반납 */}
      <div className="mc-action-bar">
<button
          className={`mc-smartkey-inner${pickupReady ? '' : ' locked'}`}
          onClick={() => navigate(
            pickupReady ? '/car-smartkey' : '/car-faceauth',
            { state: { reservation } }
          )}
        >
          <div className="mc-smartkey-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <span className="mc-smartkey-label">Smart Key</span>
          {pickupReady
            ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span className="mc-smartkey-lock-badge">
                {faceAuthDone ? '외관 촬영 필요' : '얼굴 인증 필요'}
              </span>
            )
          }
        </button>
      </div>

      {/* 분쟁 알림 모달 */}
      {showDisputeModal && (
        <div className="mc-dispute-overlay" onClick={() => setShowDisputeModal(false)}>
          <div className="mc-dispute-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-dispute-modal-icon">
              <span>!</span>
            </div>
            <p className="mc-dispute-modal-text">
              {(endDate || '').replace(/-/g, '-')} 반납하신<br/>
              차량에 대해서 업체에서<br/>
              금액을 청구했어요.
            </p>
            <div className="mc-dispute-modal-btns">
              <button
                className="mc-dispute-modal-confirm"
                onClick={() => {
                  setShowDisputeModal(false)
                  navigate('/dispute', { state: { reservation } })
                }}
              >
                확인하기
              </button>
              <button
                className="mc-dispute-modal-close"
                onClick={() => setShowDisputeModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
