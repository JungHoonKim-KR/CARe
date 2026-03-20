import { useLocation, useNavigate } from 'react-router-dom'
import './DIDCardPage.css'

export default function DIDCardPage() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const name = state?.name || '-'
  const docType = state?.docType || 'PASSPORT'
  const expiryDate = state?.expiryDate || ''
  const docId = state?.docId || ''

  const formattedExpiry = expiryDate.length === 8
    ? `${expiryDate.slice(0, 4)}.${expiryDate.slice(4, 6)}.${expiryDate.slice(6, 8)}`
    : expiryDate

  return (
    <div className="did-card-page">
      <div className="did-card-header">
        <button className="did-card-back-btn" onClick={() => navigate('/did-auth')}>
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9L9 17" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="did-card-header-title">DID 신원 증명</span>
        <span className="did-card-manage" onClick={() => navigate('/did-auth')}>관리</span>
      </div>

      <div className="did-card-wrap">
        <div className="did-card">

          <div className="did-card-top-row">
            <div className="did-card-brand">
              <span>TRUST</span>
              <span>E-SIGN</span>
            </div>
            <div className="did-card-dots">
              {Array.from({ length: 16 }).map((_, i) => (
                <span key={i} className="did-card-dot" />
              ))}
            </div>
          </div>

          <div className="did-card-shield-wrap">
            <div className="did-card-shield-bg">
              <svg width="72" height="84" viewBox="0 0 52 60" fill="none">
                <path
                  d="M26 2L4 11V28C4 41.25 13.5 53.5 26 57C38.5 53.5 48 41.25 48 28V11L26 2Z"
                  fill="rgba(255,255,255,0.15)"
                  stroke="white"
                  strokeWidth="2.5"
                />
                <path
                  d="M16 30L22 36L36 22"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="did-card-verified-chip">인증 완료</span>
          </div>

          <div className="did-card-sep" />

          <div className="did-card-info">
            <p className="did-card-label">이름</p>
            <p className="did-card-name">{name}</p>

            {formattedExpiry && (
              <>
                <p className="did-card-label" style={{ marginTop: 24 }}>만료일</p>
                <p className="did-card-expiry">
                  VALID UNTIL <span>{formattedExpiry}</span>
                </p>
              </>
            )}
          </div>

          <div className="did-card-sep" />

          <div className="did-card-did-row">
            <span className="did-card-did-label">DID</span>
            <span className="did-card-did-value">
              {docId
                ? `${docId.slice(0, 12)}...${docId.slice(-8)}`
                : 'did:care:renter:verified'}
            </span>
          </div>
        </div>

        <div className="did-card-actions">
          <button className="did-card-history-btn" onClick={() => {}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#F7A633" strokeWidth="2"/>
              <path d="M12 7V12L15 15" stroke="#F7A633" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            이용 내역
          </button>
          <button
            className="did-card-share-btn"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'DID 신원 증명', text: `${name} 님의 신원이 인증되었습니다.` })
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="6" cy="12" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="19" r="3" stroke="white" strokeWidth="2"/>
              <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
