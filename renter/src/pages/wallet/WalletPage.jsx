import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { JsonRpcProvider, formatEther } from 'ethers'
import cuteIcon2 from '../../assets/cute_icon2.png'
import BottomNav from '../../components/BottomNav'
import './WalletPage.css'

const RPC_URL = 'https://rpc.ssafy-blockchain.com'

export default function WalletPage() {
  const navigate = useNavigate()

  const didVerified =
    localStorage.getItem('passport_verified') === 'true' &&
    localStorage.getItem('license_verified') === 'true'

  const [metamaskAddress, setMetamaskAddress] = useState(
    () => localStorage.getItem('metamask_address') || null
  )
  const [balance, setBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [showFullAddr, setShowFullAddr] = useState(false)

  useEffect(() => {
    if (!metamaskAddress) { setBalance(null); return }
    const fetchBalance = async () => {
      setBalanceLoading(true)
      try {
        const provider = new JsonRpcProvider(RPC_URL)
        const raw = await provider.getBalance(metamaskAddress)
        setBalance(parseFloat(formatEther(raw)).toFixed(4))
        console.log('[Wallet] 잔액 조회:', formatEther(raw))
      } catch (e) {
        console.error('[Wallet] 잔액 조회 실패:', e)
        setBalance('오류')
      } finally {
        setBalanceLoading(false)
      }
    }
    fetchBalance()
  }, [metamaskAddress])

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  const handleDisconnect = (e) => {
    e.stopPropagation()
    localStorage.removeItem('metamask_address')
    setMetamaskAddress(null)
    setBalance(null)
  }

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
          onClick={() => { if (!metamaskAddress) navigate('/wallet-connect') }}
          style={!metamaskAddress ? { cursor: 'pointer' } : {}}
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
            {metamaskAddress ? (
              <button className="wallet-pill-btn token-pill" onClick={(e) => e.stopPropagation()}>
                충전하기
              </button>
            ) : (
              <span className="wallet-pill-btn token-connect-pill">지갑 연결 →</span>
            )}
          </div>

          <div className="token-balance-wrap">
            {metamaskAddress ? (
              <>
                <p className="token-balance-label">보유 잔액</p>
                {balanceLoading ? (
                  <p className="token-balance-value token-balance-loading">조회 중...</p>
                ) : (
                  <p className="token-balance-value">
                    {balance ?? '--'} <span className="token-balance-unit">ETH</span>
                  </p>
                )}
                <div
                  className="token-addr-wrap"
                  onMouseEnter={() => setShowFullAddr(true)}
                  onMouseLeave={() => setShowFullAddr(false)}
                  onClick={(e) => { e.stopPropagation(); setShowFullAddr((v) => !v) }}
                >
                  <span className="token-addr-text">
                    {showFullAddr ? metamaskAddress : shortAddr(metamaskAddress)}
                  </span>
                  {showFullAddr && (
                    <button className="token-addr-disconnect" onClick={handleDisconnect}>
                      해제
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="token-balance-label">MetaMask를 연결해주세요</p>
                <p className="token-balance-value token-balance-empty">-- ETH</p>
              </>
            )}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
