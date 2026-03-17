import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import carIcon from '../../assets/car_icon.png'
import BottomNav from '../../components/BottomNav'
import { getMyReservations, getCarScratches } from '../../api/reservation'
import './MyCarPage.css'

// 목 데이터 (API 응답 없을 때 fallback)
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
  endDate: '2026-03-20',
  pickupLocation: '인천국제공항',
}

const MOCK_SCRATCHES = [
  { scratchId: 1, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'PENDING' },
  { scratchId: 2, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'PENDING' },
  { scratchId: 3, reportedAt: '2025.01.15', description: '앞 범퍼 스크래치', location: 'FRONT', status: 'RESOLVED' },
]

export default function MyCarPage() {
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [scratches, setScratches] = useState([])
  const [loading, setLoading] = useState(true)
  const [smartKeyActive, setSmartKeyActive] = useState(false)

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

        {/* 예약 정보 */}
        <div className="mc-info-card">
          <div className="mc-info-row">
            <span className="mc-info-label">대여 기간</span>
            <span className="mc-info-value">{reservation.startDate} ~ {reservation.endDate}</span>
          </div>
          <div className="mc-info-row">
            <span className="mc-info-label">픽업 장소</span>
            <span className="mc-info-value">{reservation.pickupLocation}</span>
          </div>
        </div>

        {/* 차량 흠집 내역 */}
        <div className="mc-scratch-section">
          <div className="mc-scratch-header">
            <div className="mc-scratch-title-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 15h-1v-6h1v6zm0-8h-1V7h1v2z"
                  fill="#888"/>
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

      {/* 스마트키 바 */}
      <div className={`mc-smartkey-bar${smartKeyActive ? ' active' : ''}`}>
        <div className="mc-smartkey-inner">
          <div className="mc-smartkey-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <span className="mc-smartkey-label">Smart Key</span>
          <button
            className="mc-smartkey-toggle"
            onClick={() => setSmartKeyActive((v) => !v)}
          >
            {smartKeyActive ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
