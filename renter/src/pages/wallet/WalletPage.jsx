import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import cuteIcon2 from '../../assets/cute_icon2.png'
import BottomNav from '../../components/BottomNav'
import { getTokenBalance } from '../../api/auth'
import './WalletPage.css'

export default function WalletPage() {
  const navigate = useNavigate()

  const walletAddress = localStorage.getItem('embedded_wallet_address')
  const didVerified =
    localStorage.getItem('passport_verified') === 'true' &&
    localStorage.getItem('license_verified') === 'true'

  const [careBalance, setCareBalance] = useState(null)
  const [careLoading, setCareLoading] = useState(false)
  const [showFullAddr, setShowFullAddr] = useState(false)

  useEffect(() => {
    if (!walletAddress) return
    setCareLoading(true)
    getTokenBalance()
      .then((data) => setCareBalance(data.balance))
      .catch((e) => {
        console.error('[Wallet] 잔액 조회 실패:', e)
        setCareBalance('오류')
      })
      .finally(() => setCareLoading(false))
  }, [walletAddress])

  const shortAddr = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '')

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <button className="wallet-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#111" />
          </svg>
        </button>
        <h1 className="wallet-title">내 지갑</h1>
      </div>

      <div className="wallet-stack-area">

        {/* DID card */}
        <div className="wallet-card wallet-did-card" onClick={() => navigate('/did-auth')}>
          <div className="wallet-card-row">
            <div className="wallet-card-left">
              <div className="did-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 4L5.5 10L2.5 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="wallet-card-name">DID 신원증명</span>
            </div>
            <button
              className={`wallet-pill-btn ${didVerified ? 'did-verified-pill' : ''}`}
              onClick={(e) => { e.stopPropagation(); if (!didVerified) navigate('/did-auth') }}
            >
              {didVerified ? '인증완료 ✓' : '등록하기'}
            </button>
          </div>
          <div className="did-face-illust">
            <img src={cuteIcon2} alt="" className="did-cute-icon" />
          </div>
        </div>

        {/* Token card */}
        <div
          className="wallet-card wallet-token-card"
          onClick={() => navigate('/wallet/token')}
          style={{ cursor: 'pointer' }}
        >
          <div className="token-circle-bg" />

          <div className="wallet-card-row">
            <div className="wallet-card-left">
              <div className="token-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5L8.6 5.4H12.7L9.5 7.7L10.9 11.6L7 9.3L3.1 11.6L4.5 7.7L1.3 5.4H5.4L7 1.5Z" fill="white" />
                </svg>
              </div>
              <span className="wallet-card-name token-name">잔여 토큰</span>
            </div>
          </div>

          <div className="token-balance-wrap">
            <p className="token-balance-label">보유 CARE</p>
            {careLoading ? (
              <p className="token-balance-value token-balance-loading">조회 중...</p>
            ) : (
              <p className="token-balance-value">
                {careBalance ?? '--'} <span className="token-balance-unit">CARE</span>
              </p>
            )}
            {walletAddress && (
              <div
                className="token-addr-wrap"
                onClick={() => setShowFullAddr((v) => !v)}
              >
                <span className="token-addr-text">
                  {showFullAddr ? walletAddress : shortAddr(walletAddress)}
                </span>
              </div>
            )}
          </div>

          <div className="token-card-hint">사용 내역 보기 ›</div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
