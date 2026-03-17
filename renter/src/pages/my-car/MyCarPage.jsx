import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import carIcon from '../../assets/car_icon.png'
import BottomNav from '../../components/BottomNav'
import { getMyReservations, getCarScratches } from '../../api/reservation'
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

const MOCK_SCRATCHES = [
  { scratchId: 1, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'PENDING' },
  { scratchId: 2, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'PENDING' },
  { scratchId: 3, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'RESOLVED' },
]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatDateLabel(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return { month: d.getMonth() + 1, day: d.getDate(), weekday: WEEKDAYS[d.getDay()] }
}

export default function MyCarPage() {
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [scratches, setScratches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCrackAlert, setShowCrackAlert] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyReservations()
        const active = Array.isArray(data)
          ? data.find((r) => r.status === 'ACTIVE') || data[0]
          : data?.data?.find?.((r) => r.status === 'ACTIVE') || data?.data?.[0] || data
        if (active) {
          setReservation(active)
          try {
            const scratchData = await getCarScratches(active.reservationId)
            setScratches(Array.isArray(scratchData) ? scratchData : scratchData?.data || [])
          } catch {
            setScratches(MOCK_SCRATCHES)
          }
        } else {
          setReservation(null)
        }
      } catch {
        setReservation(MOCK_RESERVATION)
        setScratches(MOCK_SCRATCHES)
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

  const pendingCount = scratches.filter((s) => s.status === 'PENDING').length
  const crackDone = reservation
    ? localStorage.getItem(`crackDone_${reservation.reservationId}`) === 'true'
    : false
  const startLabel = formatDateLabel(reservation.startDate)
  const endLabel = formatDateLabel(reservation.endDate)

  return (
    <div className="mc-page">
      <div className="mc-scroll">
        {/* 차량 헤더 */}
        <div className="mc-car-header">
          <div className="mc-plate-row">
            <span className="mc-plate">{reservation.plateNumber}</span>
            <span className="mc-nft-badge">NFT # {reservation.nftTokenId}</span>
          </div>
          <h1 className="mc-car-name">{reservation.carName}</h1>
        </div>

        {/* 차량 이미지 */}
        <div className="mc-car-image-wrap">
          {reservation.carImageUrl ? (
            <img src={reservation.carImageUrl} alt={reservation.carName} className="mc-car-image" />
          ) : (
            <div className="mc-car-emoji-wrap">
              <span className="mc-car-emoji">🚗</span>
            </div>
          )}
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
              {startLabel && (
                <p className="mc-schedule-date">
                  {startLabel.month}월 {startLabel.day}일
                  <span className="mc-schedule-weekday"> ({startLabel.weekday})</span>
                </p>
              )}
              <p className="mc-schedule-time">{reservation.startTime || '--:--'}</p>
            </div>

            <div className="mc-schedule-arrow">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="#F7A633" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="mc-schedule-col">
              <span className="mc-schedule-tag return">반납</span>
              {endLabel && (
                <p className="mc-schedule-date">
                  {endLabel.month}월 {endLabel.day}일
                  <span className="mc-schedule-weekday"> ({endLabel.weekday})</span>
                </p>
              )}
              <p className="mc-schedule-time">{reservation.endTime || '--:--'}</p>
            </div>
          </div>
          <div className="mc-schedule-location">
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#F7A633"/>
            </svg>
            <span>{reservation.pickupLocation}</span>
          </div>
        </div>

        {/* 차량 흠집 내역 */}
        <div className="mc-scratch-section">
          <div className="mc-scratch-header">
            <div className="mc-scratch-title-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 15h-1v-6h1v6zm0-8h-1V7h1v2z" fill="#888"/>
              </svg>
              <span className="mc-scratch-title">차량 흠집 내역</span>
              {pendingCount > 0 && (
                <span className="mc-scratch-badge">{pendingCount}</span>
              )}
            </div>
            <button
              className="mc-scratch-more"
              onClick={() => navigate('/damage-history', { state: { reservation, scratches } })}
            >
              상세 보기 →
            </button>
          </div>

          {scratches.length === 0 ? (
            <div className="mc-scratch-empty">발견된 흠집이 없습니다.</div>
          ) : (
            <div className="mc-scratch-list">
              {scratches.slice(0, 3).map((s) => (
                <div key={s.scratchId} className="mc-scratch-item">
                  <span className="mc-scratch-date">{s.reportedAt}</span>
                  <span className="mc-scratch-desc">{s.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 140 }} />
      </div>

      {/* 스마트키 바 - 클릭 시 얼굴 인증으로 이동 */}
      <div className="mc-smartkey-bar">
        <button
          className={`mc-smartkey-inner${!crackDone ? ' locked' : ''}`}
          onClick={() => {
            if (!crackDone) {
              setShowCrackAlert(true)
            } else {
              navigate('/car-faceauth', { state: { reservation } })
            }
          }}
        >
          <div className="mc-smartkey-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <span className="mc-smartkey-label">Smart Key</span>
          {!crackDone && <span className="mc-smartkey-lock-badge">외관 촬영 필요</span>}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 외관 촬영 필요 알림 모달 */}
      {showCrackAlert && (
        <div className="mc-alert-overlay" onClick={() => setShowCrackAlert(false)}>
          <div className="mc-alert-sheet" onClick={e => e.stopPropagation()}>
            <div className="mc-alert-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#F7A633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="mc-alert-title">외관 촬영이 필요해요</h3>
            <p className="mc-alert-desc">
              스마트키 발급 전, 차량 외관 4방향 촬영을 먼저 완료해주세요.
              <br/>촬영 기록은 블록체인에 안전하게 저장돼요.
            </p>
            <button
              className="mc-alert-btn"
              onClick={() => {
                setShowCrackAlert(false)
                navigate('/car-crack', { state: { reservation } })
              }}
            >
              📷 외관 촬영하러 가기
            </button>
            <button className="mc-alert-cancel" onClick={() => setShowCrackAlert(false)}>
              닫기
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
