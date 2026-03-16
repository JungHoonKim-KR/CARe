import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BottomNav from '../../components/BottomNav'
import './WalletPage.css'

const TRANSACTIONS = [
  { id: 1, type: 'charge', amount: 50000, date: '2025-03-10', desc: '포인트 충전' },
  { id: 2, type: 'use', amount: -23000, date: '2025-03-08', desc: '차량 렌트 결제' },
  { id: 3, type: 'charge', amount: 100000, date: '2025-02-28', desc: '포인트 충전' },
  { id: 4, type: 'use', amount: -45000, date: '2025-02-20', desc: '차량 렌트 결제' },
]

export default function WalletPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [flipped, setFlipped] = useState(false)
  const balance = 82000

  return (
    <div className="wallet-page">
      <div className="wallet-topbar">
        <button className="wallet-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#222" />
          </svg>
        </button>
        <h1 className="wallet-title">{t('profile.wallet')}</h1>
      </div>

      <div className="wallet-card-wrap">
        <div
          className={`wallet-card${flipped ? ' flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className="wallet-card-front">
            <div className="wallet-card-logo">CARe</div>
            <div className="wallet-card-balance-label">{t('profile.availableBalance')}</div>
            <div className="wallet-card-balance">
              ₩ {balance.toLocaleString()}
            </div>
            <div className="wallet-card-hint">{t('profile.cardHint')}</div>
            <div className="wallet-card-circles">
              <span />
              <span />
            </div>
          </div>
          <div className="wallet-card-back">
            <div className="wallet-card-strip" />
            <div className="wallet-card-cvv-wrap">
              <span className="wallet-card-cvv-label">CVV</span>
              <div className="wallet-card-cvv-box">• • •</div>
            </div>
            <div className="wallet-card-logo-back">CARe Pay</div>
          </div>
        </div>
      </div>

      <div className="wallet-actions">
        <button className="wallet-action-btn">
          <span className="wallet-action-icon">+</span>
          충전하기
        </button>
        <button className="wallet-action-btn">
          <span className="wallet-action-icon">↑</span>
          출금하기
        </button>
      </div>

      <div className="wallet-history">
        <div className="wallet-history-header">
          <span className="wallet-history-title">거래 내역</span>
          <span className="wallet-view-all">{t('profile.viewAll')}</span>
        </div>
        <ul className="wallet-history-list">
          {TRANSACTIONS.map((tx) => (
            <li key={tx.id} className="wallet-tx-item">
              <div className="wallet-tx-icon-wrap">
                <span className={`wallet-tx-icon ${tx.type}`}>
                  {tx.type === 'charge' ? '↓' : '↑'}
                </span>
              </div>
              <div className="wallet-tx-info">
                <span className="wallet-tx-desc">{tx.desc}</span>
                <span className="wallet-tx-date">{tx.date}</span>
              </div>
              <span className={`wallet-tx-amount ${tx.type}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
              </span>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </div>
  )
}
