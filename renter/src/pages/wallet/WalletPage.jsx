import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { JsonRpcProvider, formatEther } from 'ethers'
import cuteIcon2 from '../../assets/cute_icon2.png'
import BottomNav from '../../components/BottomNav'
import { getCareBalance, callFaucet, FAUCET_AMOUNT } from '../../utils/careToken'
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
  const [careBalance, setCareBalance] = useState(null)
  const [careLoading, setCareLoading] = useState(false)
  const [faucetLoading, setFaucetLoading] = useState(false)
  const [showFullAddr, setShowFullAddr] = useState(false)

  useEffect(() => {
    if (!metamaskAddress) { setBalance(null); setCareBalance(null); return }

    const fetchBalance = async () => {
      setBalanceLoading(true)
      try {
        const provider = new JsonRpcProvider(RPC_URL)
        const raw = await provider.getBalance(metamaskAddress)
        setBalance(parseFloat(formatEther(raw)).toFixed(4))
      } catch (e) {
        console.error('[Wallet] ETH 잔액 조회 실패:', e)
        setBalance('오류')
      } finally {
        setBalanceLoading(false)
      }
    }

    const fetchCareBalance = async () => {
      setCareLoading(true)
      try {
        const bal = await getCareBalance(metamaskAddress)
        setCareBalance(bal)
      } catch (e) {
        console.error('[Wallet] CARE 잔액 조회 실패:', e)
        setCareBalance('오류')
      } finally {
        setCareLoading(false)
      }
    }

    fetchBalance()
    fetchCareBalance()
  }, [metamaskAddress])

  const handleFaucet = async (e) => {
    e.stopPropagation()
    const pk = sessionStorage.getItem('wallet_pk')
    if (!pk) {
      alert('지갑을 다시 연결해주세요.')
      return
    }
    setFaucetLoading(true)
    try {
      await callFaucet(pk, metamaskAddress)
      const bal = await getCareBalance(metamaskAddress)
      setCareBalance(bal)
    } catch (err) {
      console.error('[Faucet] 실패:', err)
      alert('충전에 실패했습니다.')
    } finally {
      setFaucetLoading(false)
    }
  }

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  const handleDisconnect = (e) => {
    e.stopPropagation()
    localStorage.removeItem('metamask_address')
    sessionStorage.removeItem('wallet_pk')
    setMetamaskAddress(null)
    setBalance(null)
    setCareBalance(null)
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
              <button
                className="wallet-pill-btn token-pill"
                onClick={handleFaucet}
                disabled={faucetLoading}
              >
                {faucetLoading ? '충전 중...' : `+${FAUCET_AMOUNT} CARE`}
              </button>
            ) : (
              <span className="wallet-pill-btn token-connect-pill">지갑 연결 →</span>
            )}
          </div>

          <div className="token-balance-wrap">
            {metamaskAddress ? (
              <>
                <p className="token-balance-label">보유 CARE</p>
                {careLoading ? (
                  <p className="token-balance-value token-balance-loading">조회 중...</p>
                ) : (
                  <p className="token-balance-value">
                    {careBalance ?? '--'} <span className="token-balance-unit">CARE</span>
                  </p>
                )}
                <p className="token-balance-label" style={{ marginTop: '4px' }}>ETH</p>
                {balanceLoading ? (
                  <p className="token-balance-value token-balance-loading" style={{ fontSize: '14px' }}>조회 중...</p>
                ) : (
                  <p className="token-balance-value" style={{ fontSize: '14px' }}>
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
