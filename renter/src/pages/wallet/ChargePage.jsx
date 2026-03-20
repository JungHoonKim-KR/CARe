import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chargeToken } from '../../api/auth'
import './ChargePage.css'

const PRESET_AMOUNTS = [10, 50, 100, 500]

export default function ChargePage() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { balance, txHash }
  const [error, setError] = useState('')

  const handleCharge = async () => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      setError('올바른 금액을 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await chargeToken(parsed)
      setResult(data)
    } catch (e) {
      console.error('[Charge] 충전 실패:', e)
      setError(e.response?.data?.message || '충전에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="charge-page">
        <div className="charge-header">
          <button className="charge-back-btn" onClick={() => navigate('/wallet')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#111" />
            </svg>
          </button>
          <h1 className="charge-title">충전 완료</h1>
        </div>

        <div className="charge-success-card">
          <div className="charge-success-icon">✓</div>
          <p className="charge-success-label">충전 완료</p>
          <p className="charge-success-amount">{result.amount} <span>CARE</span></p>
          <div className="charge-success-divider" />
          <div className="charge-success-row">
            <span>현재 잔액</span>
            <strong>{result.balance} CARE</strong>
          </div>
          <div className="charge-success-row">
            <span>TX Hash</span>
            <span className="charge-tx-hash">
              {result.txHash ? `${result.txHash.slice(0, 10)}...${result.txHash.slice(-6)}` : '-'}
            </span>
          </div>
        </div>

        <button className="charge-confirm-btn" onClick={() => navigate('/wallet')}>
          확인
        </button>
      </div>
    )
  }

  return (
    <div className="charge-page">
      <div className="charge-header">
        <button className="charge-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#111" />
          </svg>
        </button>
        <h1 className="charge-title">CARE 충전</h1>
      </div>

      <div className="charge-body">
        <p className="charge-label">충전 금액</p>

        <div className="charge-input-wrap">
          <input
            className="charge-input"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError('') }}
          />
          <span className="charge-input-unit">CARE</span>
        </div>

        {error && <p className="charge-error">{error}</p>}

        <div className="charge-preset-row">
          {PRESET_AMOUNTS.map((v) => (
            <button
              key={v}
              className={`charge-preset-btn ${parseFloat(amount) === v ? 'active' : ''}`}
              onClick={() => { setAmount(String(v)); setError('') }}
            >
              +{v}
            </button>
          ))}
        </div>

        <div className="charge-info-box">
          <p>• 환전 없이 CARE Token으로 즉시 결제</p>
          <p>• 충전된 토큰은 렌탈 결제에 바로 사용 가능</p>
        </div>
      </div>

      <button
        className="charge-confirm-btn"
        onClick={handleCharge}
        disabled={loading || !amount}
      >
        {loading ? '충전 중...' : '충전하기'}
      </button>
    </div>
  )
}
