import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { Wallet } from 'ethers'
import './WalletConnectPage.css'

export default function WalletConnectPage() {
  const navigate = useNavigate()
  const { login: privyLogin } = usePrivy()

  const [privateKey, setPrivateKey] = useState('')
  const [pkError, setPkError] = useState('')
  const [showPkInput, setShowPkInput] = useState(false)

  const handleConnectMetaMask = () => {
    setPkError('')
    try {
      const key = privateKey.trim().startsWith('0x') ? privateKey.trim() : `0x${privateKey.trim()}`
      const wallet = new Wallet(key)
      console.log('[MetaMask] 연결된 주소:', wallet.address)
      localStorage.setItem('metamask_address', wallet.address)
      navigate(-1)
    } catch {
      setPkError('유효하지 않은 개인키입니다.')
    }
  }

  return (
    <div className="wc-page">
      <div className="wc-header">
        <button className="wc-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#111" />
          </svg>
        </button>
        <h1 className="wc-title">지갑 연결</h1>
      </div>

      <div className="wc-body">
        <p className="wc-subtitle">CARe 토큰을 사용하려면<br />지갑을 연결해주세요.</p>

        {/* Privy 옵션 */}
        <div className="wc-option-card" onClick={privyLogin}>
          <div className="wc-option-icon wc-privy-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          <div className="wc-option-text">
            <p className="wc-option-title">Privy 임베디드 지갑</p>
            <p className="wc-option-desc">이메일로 로그인하면 지갑이 자동 생성됩니다</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* MetaMask 옵션 */}
        <div className="wc-option-card" onClick={() => setShowPkInput(!showPkInput)}>
          <div className="wc-option-icon wc-metamask-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l7 4.5-7 4.5z"/>
            </svg>
          </div>
          <div className="wc-option-text">
            <p className="wc-option-title">MetaMask</p>
            <p className="wc-option-desc">개인키를 입력하여 직접 연결합니다</p>
          </div>
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            style={{ transform: showPkInput ? 'rotate(90deg)' : 'none', transition: '0.2s' }}
          >
            <path d="M9 18l6-6-6-6" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {showPkInput && (
          <div className="wc-pk-wrap">
            <input
              className="wc-pk-input"
              type="password"
              placeholder="0x... 개인키 입력"
              value={privateKey}
              onChange={(e) => { setPrivateKey(e.target.value); setPkError('') }}
              autoComplete="off"
            />
            {pkError && <p className="wc-pk-error">{pkError}</p>}
            <button
              className="wc-pk-btn"
              onClick={handleConnectMetaMask}
              disabled={!privateKey.trim()}
            >
              연결하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
