import { useNavigate, useLocation } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import './DisputePage.css'

export default function DisputePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const reservation = state?.reservation
  const disputeDate = state?.disputeDate
    || (reservation?.reservationId
      ? localStorage.getItem(`disputeDate_${reservation.reservationId}`)
      : null)
    || reservation?.endDate
    || '2026-03-17'

  const handleSettle = () => {
    if (reservation?.reservationId) {
      localStorage.removeItem(`disputePending_${reservation.reservationId}`)
      localStorage.removeItem(`disputeDate_${reservation.reservationId}`)
    }
    navigate('/my-car')
  }

  const handleDispute = () => {
    navigate('/dispute-history', { state: { reservation } })
  }

  return (
    <div className="dp-page">
      {/* 헤더 */}
      <header className="dp-header">
        <button className="dp-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img src={careLogo} alt="CARe" className="dp-logo" />
        <div style={{ width: 38 }} />
      </header>

      <div className="dp-scroll">
        {/* 분쟁 배너 */}
        <button className="dp-dispute-banner" onClick={handleDispute}>
          <div className="dp-banner-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01" stroke="white" strokeWidth="2.2"
                strokeLinecap="round"/>
              <path d="M12 2L2 20h20L12 2z" stroke="white" strokeWidth="2"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="dp-banner-text">
            <p className="dp-banner-title">분쟁이 발생했어요!</p>
            <p className="dp-banner-sub">이전 흠집 로그 확인하기 →</p>
          </div>
        </button>

        {/* AI 유사도 판별 결과 */}
        <div className="dp-section">
          <p className="dp-section-title">AI 유사도 판별 결과</p>
          <div className="dp-compare-row">
            {/* Before */}
            <div className="dp-compare-card">
              <div className="dp-compare-img before">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#ccc" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="#ccc" strokeWidth="1.5"/>
                  <circle cx="17.5" cy="7.5" r="1" fill="#ccc"/>
                </svg>
              </div>
              <p className="dp-compare-label">Before</p>
              <p className="dp-compare-date">2025년 3월 12일 2:24 pm</p>
              <span className="dp-compare-tag normal">Normal</span>
            </div>

            {/* After */}
            <div className="dp-compare-card">
              <div className="dp-compare-img after">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#ccc" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="#ccc" strokeWidth="1.5"/>
                  <circle cx="17.5" cy="7.5" r="1" fill="#ccc"/>
                  <path d="M5 9l3 3M7 7l4 4" stroke="#FF4D4F" strokeWidth="1.5"
                    strokeLinecap="round"/>
                </svg>
              </div>
              <p className="dp-compare-label">After</p>
              <p className="dp-compare-date">2025년 3월 13일 11:57 am</p>
              <span className="dp-compare-tag attention">Requires Attention</span>
            </div>
          </div>
        </div>

        {/* 설명 텍스트 */}
        <div className="dp-desc-box">
          <p className="dp-desc-text">
            이전에 발생했던 흠집과 달리<br/>
            유사도가 <strong>5%</strong>로 확인되는<br/>
            다른 흠집들이 발견됐어요.<br/>
            관련 사항에 대해 소명을 하고 싶으신 경우<br/>
            이의 신청 버튼을 해주세요.
          </p>
        </div>

        <div style={{ height: 180 }} />
      </div>

      {/* 하단 버튼 */}
      <div className="dp-footer">
        <button className="dp-settle-btn" onClick={handleSettle}>
          그냥 정산할게요
        </button>
        <button className="dp-dispute-btn" onClick={handleDispute}>
          이의 신청
        </button>
      </div>
    </div>
  )
}
