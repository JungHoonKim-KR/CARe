import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTokenBalance } from '../../api/auth'
import { getTokenHistory } from '../../utils/careToken'
import './TokenHistoryPage.css'

export default function TokenHistoryPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    setLoading(true)
    getTokenBalance()
      .then((data) => setBalance(data.balance))
      .catch(() => setBalance('오류'))
      .finally(() => setLoading(false))

    setHistory(getTokenHistory())
  }, [])

  const formatDate = (iso) => {
    const d = new Date(iso)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${d.getFullYear()}.${mm}.${dd} ${hh}:${min}`
  }

  return (
    <div className="token-history-page">
      <div className="token-history-header">
        <button className="token-history-back" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#111" />
          </svg>
        </button>
        <h1 className="token-history-title">토큰 내역</h1>
      </div>

      {/* 잔액 카드 */}
      <div className="token-history-balance-card">
        <p className="token-history-balance-label">보유 CARE</p>
        {loading ? (
          <p className="token-history-balance-value loading">조회 중...</p>
        ) : (
          <p className="token-history-balance-value">
            {balance != null ? Number(balance).toLocaleString() : '--'} <span>CARE</span>
          </p>
        )}
        <div className="token-history-action-row">
          <button
            className="token-history-btn charge"
            onClick={() => navigate('/wallet/charge')}
          >
            충전
          </button>
          <button
            className="token-history-btn exchange"
            onClick={() => alert('환전 기능은 준비 중입니다.')}
          >
            환전
          </button>
        </div>
      </div>

      {/* 사용 내역 */}
      <div className="token-history-list-card">
        <p className="token-history-list-title">사용 내역</p>

        {history.length === 0 ? (
          <div className="token-history-empty">
            <div className="token-history-empty-icon">🪙</div>
            <p>아직 사용 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="token-history-list">
            {history.map((item, i) => (
              <li key={i} className="token-history-item">
                <div className="token-history-item-left">
                  <span className={`token-history-item-badge ${item.type}`}>
                    {item.type === 'charge' ? '충전' : '결제'}
                  </span>
                  <div>
                    <p className="token-history-item-desc">{item.desc}</p>
                    <p className="token-history-item-date">{formatDate(item.date)}</p>
                  </div>
                </div>
                <p className={`token-history-item-amount ${item.type}`}>
                  {item.type === 'charge' ? '+' : '-'}{Number(item.amount).toLocaleString()} CARE
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
