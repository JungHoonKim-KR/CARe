import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import { createReservation } from '../../api/reservation'
import { getTokenBalance } from '../../api/auth'
import './PaymentPage.css'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const car         = state?.car         || {}
  const carId       = state?.carId       || car.id || car.carId || ''
  const insuranceId = state?.insuranceId || ''
  const searchInfo  = state?.searchInfo  || {}
  const insurance   = state?.insurance   || { label: '스탠다드', price: 80 }
  const rentalPrice = state?.rentalPrice || 1033
  const deposit     = state?.deposit     || 300
  const total       = state?.total       || rentalPrice + insurance.price + deposit

  const [walletBalance, setWalletBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getTokenBalance().then((data) => setWalletBalance(parseFloat(data.balance))).catch(() => {})
  }, [])

  const handlePay = async () => {
    if (walletBalance < total) {
      setError('보유 토큰이 부족합니다.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await createReservation(carId, insuranceId, total)
      navigate('/booking-complete', {
        state: {
          car,
          searchInfo,
          total,
          rentalPrice,
          insurance,
          deposit,
          reservationId: result.reservationId || result.data?.reservationId,
          paymentTxHash: result.paymentTxHash || result.data?.paymentTxHash,
        },
      })
    } catch (err) {
      const msg = err.response?.data?.message || '결제에 실패했습니다. 다시 시도해주세요.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const pickupLabel = searchInfo.pickupDate
    ? `${searchInfo.pickupDate}(${dow(searchInfo.pickupDate)}) 오전 ${searchInfo.pickupTime || '10:00'}`
    : '2026.3.13(금) 오전 10:00'

  const returnLabel = searchInfo.returnDate
    ? `${searchInfo.returnDate}(${dow(searchInfo.returnDate)}) 오전 ${searchInfo.returnTime || '10:00'}`
    : '2026.3.15(일) 오전 10:00'

  const modelName = car.name
    ? car.name.split(' ').slice(-2).join(' ')
    : 'SL65 AMG'

  return (
    <div className="pay-wrap">
      {/* 헤더 */}
      <header className="pay-header">
        <button className="pay-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="pay-title">결제하기</h1>
        <div style={{ width: 30 }} />
      </header>

      <div className="pay-scroll">

        <p className="pay-sec-title">토큰 결제</p>

        <div className="pay-wallet-card">
          <div className="pay-wallet-head">
            <span className="pay-wallet-ico">🗂</span>
            <span className="pay-wallet-lbl">내 지갑</span>
          </div>
          <div className="pay-divider" />
          <div className="pay-row">
            <span className="pay-row-lbl">보유 토큰</span>
            <span className="pay-row-val pay-row-bold">{walletBalance != null ? walletBalance.toLocaleString() : '...'} CARE</span>
          </div>
          <div className="pay-row">
            <span className="pay-row-lbl">결제 금액</span>
            <span className="pay-row-val">{(rentalPrice + insurance.price).toLocaleString()} USDC</span>
          </div>
        </div>

        <div className="pay-info-card">
          <p className="pay-card-title">예약 상세</p>
          <div className="pay-row">
            <span className="pay-row-lbl">차량 모델</span>
            <span className="pay-row-val">{modelName}</span>
          </div>
          <div className="pay-row">
            <span className="pay-row-lbl">픽업 공항</span>
            <span className="pay-row-val">{searchInfo.location || '나리타 공항, 도쿄'}</span>
          </div>
          <div className="pay-row">
            <span className="pay-row-lbl">픽업일</span>
            <span className="pay-row-val">{pickupLabel}</span>
          </div>
          <div className="pay-row pay-row-last">
            <span className="pay-row-lbl">반납일</span>
            <span className="pay-row-val">{returnLabel}</span>
          </div>
        </div>

        <div className="pay-info-card">
          <p className="pay-card-title">결제 상세</p>
          <div className="pay-row">
            <span className="pay-row-lbl">차량 대여료</span>
            <span className="pay-row-val">{rentalPrice.toLocaleString()} USDC</span>
          </div>
          <div className="pay-row">
            <span className="pay-row-lbl">{insurance.label} 보험료</span>
            <span className="pay-row-val">{insurance.price.toLocaleString()} USDC</span>
          </div>
          <div className="pay-row">
            <span className="pay-row-lbl">예치 보증금</span>
            <span className="pay-row-val">{deposit.toLocaleString()} USDC</span>
          </div>
          <div className="pay-total-line" />
          <div className="pay-row pay-row-last pay-row-total">
            <span className="pay-total-lbl">총 결제</span>
            <span className="pay-total-val">{total.toLocaleString()} USDC</span>
          </div>
        </div>

        {error && <p className="pay-error">{error}</p>}

        <div style={{ height: 120 }} />
      </div>

      <div className="pay-btn-area">
        <button className="pay-btn" onClick={handlePay} disabled={loading}>
          {loading ? '처리 중...' : `${total.toLocaleString()} USDC 결제하기`}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

function dow(dateStr) {
  if (!dateStr) return ''
  try {
    return ['일','월','화','수','목','금','토'][new Date(dateStr).getDay()]
  } catch { return '' }
}
