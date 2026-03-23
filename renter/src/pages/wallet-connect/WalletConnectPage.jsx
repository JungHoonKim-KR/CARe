import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'ethers'
import './WalletConnectPage.css'

export default function WalletConnectPage() {
  const navigate = useNavigate()
  const [privateKey, setPrivateKey] = useState('')
  const [pkError, setPkError] = useState('')

  const handleConnectMetaMask = () => {
    setPkError('')
    try {
      const key = privateKey.trim().startsWith('0x') ? privateKey.trim() : `0x${privateKey.trim()}`
      const wallet = new Wallet(key)
      console.log('[MetaMask] 연결된 주소:', wallet.address)
      localStorage.setItem('metamask_address', wallet.address)
      sessionStorage.setItem('wallet_pk', key)
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
        <h1 className="wc-title">MetaMask 연결</h1>
      </div>

      <div className="wc-body">
        <p className="wc-subtitle">MetaMask 개인키를 입력하면<br />지갑이 연결됩니다.</p>

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
      </div>
    </div>
  )
}
