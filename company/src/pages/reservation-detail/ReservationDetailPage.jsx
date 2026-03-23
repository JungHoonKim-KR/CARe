import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReservationService from '../../services/ReservationService'
import './ReservationDetailPage.css'

export default function ReservationDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [reservationData, setReservationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReservationDetail()
  }, [id])

  const fetchReservationDetail = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await ReservationService.getReservationDetail(id)

      if (result.success) {
        const data = result.data

        // API 응답 데이터를 UI 형식으로 변환
        const formattedData = {
          carName: `${data.car.brand} ${data.car.modelName}`,
          carType: '-', // API에서 제공하지 않음
          plateNumber: data.car.plateNumber,
          status: getStatusLabel(data.status),
          pickup: {
            date: formatDateTime(data.pickupDate),
            location: '-', // API에서 제공하지 않음
            completed: isPickupCompleted(data.status),
          },
          dropoff: {
            date: formatDateTime(data.returnDate),
            location: '-', // API에서 제공하지 않음
            completed: isReturnCompleted(data.status),
          },
          renter: {
            name: data.renter.name,
            country: '-', // API에서 제공하지 않음
            email: data.renter.email,
          },
          payment: {
            rentalFee: 0, // API에서 제공하지 않음
            insurance: data.insurance.price,
            deposit: 0, // API에서 제공하지 않음
            total: 0, // API에서 제공하지 않음
          },
          defects: {
            pickup: 0, // beforeScanTxHash로 조회 필요
            dropoff: 0, // afterScanTxHash로 조회 필요
            newDefects: 0,
          },
          dispute: data.status === 'DISPUTE' ? {
            reason: '-',
            claimAmount: 0,
          } : null,
          smartContractAddress: data.smartContractAddress,
          depositStatus: data.depositStatus,
          beforeScanTxHash: data.beforeScanTxHash,
          afterScanTxHash: data.afterScanTxHash,
        }

        setReservationData(formattedData)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('예약 상세 조회 에러:', err)
      setError('예약 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '-'
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}.${month}.${day} ${hours}:${minutes}`
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': '예약대기',
      'CONFIRMED': '예약완료',
      'IN_PROGRESS': '이용중',
      'COMPLETED': '반납완료',
      'DISPUTE': '분쟁중',
      'CANCELLED': '취소됨'
    }
    return statusMap[status] || status
  }

  const isPickupCompleted = (status) => {
    return ['IN_PROGRESS', 'COMPLETED', 'DISPUTE'].includes(status)
  }

  const isReturnCompleted = (status) => {
    return ['COMPLETED', 'DISPUTE'].includes(status)
  }

  if (loading) {
    return (
      <div className="reservation-detail-page">
        <div className="loading-container">
          <p>예약 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reservation-detail-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>돌아가기</button>
        </div>
      </div>
    )
  }

  if (!reservationData) {
    return null
  }

  return (
    <div className="reservation-detail-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="page-title">예약 상세</h1>
        {reservationData.status && (
          <span className={`status-badge ${reservationData.status === '분쟁중' ? 'dispute' : ''}`}>
            ⚠️ {reservationData.status}
          </span>
        )}
      </div>

      <h2 className="car-title">{reservationData.carName}</h2>

      <div className="detail-content">
        <div className="left-column">
          {/* 차량 정보 */}
          <div className="info-card">
            <h3 className="card-title"> 차량 정보
            </h3>
            <div className="info-row">
              <span className="info-label">차량명</span>
              <span className="info-value">{reservationData.carName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">차종</span>
              <span className="info-value">{reservationData.carType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">차량번호</span>
              <span className="info-value">{reservationData.plateNumber}</span>
            </div>
          </div>

          {/* 대여 일정 */}
          <div className="info-card">
            <h3 className="card-title">대여 일정</h3>
            <div className="schedule-section">
              <div className="schedule-item">
                <span className="schedule-label">픽업</span>
                <div className="schedule-details">
                  <div className="schedule-date">{reservationData.pickup.date}</div>
                  <div className="schedule-location">{reservationData.pickup.location}</div>
                </div>
              </div>
              <div className="schedule-divider"></div>
              <div className="schedule-item">
                <span className="schedule-label">반납</span>
                <div className="schedule-details">
                  <div className="schedule-date">{reservationData.dropoff.date}</div>
                  <div className="schedule-location">{reservationData.dropoff.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 이용 상태 */}
          <div className="info-card">
            <h3 className="card-title">
              <span className="title-icon">📋</span> 이용 상태
            </h3>

            {/* 픽업/반납 상태 박스 */}
            <div className="usage-status-grid">
              {/* 픽업 정보 */}
              <div className={`status-box pickup ${reservationData.pickup.completed ? 'completed' : ''}`}>
                <div className="status-header">
                  <span className="status-check">
                    {reservationData.pickup.completed && <span className="check-icon">✓</span>} 픽업
                  </span>
                  {reservationData.pickup.completed && (
                    <button className="view-photos-btn">
                      <span className="camera-icon">📷</span> 사진 보기
                    </button>
                  )}
                </div>
                {reservationData.pickup.completed && (
                  <>
                    <div className="status-datetime">{reservationData.pickup.date}</div>
                    <div className="status-detail">
                      기존 결함: {reservationData.defects.pickup}건 (AI 탐지)
                    </div>
                  </>
                )}
              </div>

              {/* 반납 정보 */}
              <div className={`status-box return ${reservationData.dropoff.completed ? 'completed' : ''}`}>
                <div className="status-header">
                  <span className="status-check">
                    {reservationData.dropoff.completed && <span className="check-icon">✓</span>} 반납
                  </span>
                  {reservationData.dropoff.completed && (
                    <button className="view-photos-btn">
                      <span className="camera-icon">📷</span> 사진 보기
                    </button>
                  )}
                </div>
                {reservationData.dropoff.completed && (
                  <>
                    <div className="status-datetime">{reservationData.dropoff.date}</div>
                    <div className="status-detail">
                      결함: {reservationData.defects.dropoff}건 (AI 탐지)
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 새로운 결함 강조 표시 */}
            {reservationData.defects.newDefects > 0 && (
              <div className="defect-alert-banner">
                ⚠️ 새로운 결함 {reservationData.defects.newDefects}건 발견
              </div>
            )}

            {/* 액션 버튼 그룹 */}
            <div className="action-buttons-group">
              {/* 분쟁 정보 버튼 */}
              {reservationData.dispute && (
                <button
                  className="dispute-button"
                  onClick={() => navigate(`/disputes/${id}`)}
                >
                  분쟁 정보 확인하기
                </button>
              )}

              {/* AI 리포트 버튼 */}
              <button
                className="ai-report-button"
                onClick={() => navigate(`/ai-report/${id}`)}
              >
                AI 리포트 확인하기
              </button>
            </div>
          </div>
        </div>

        <div className="right-column">
          {/* 대여자 정보 */}
          <div className="info-card">
            <h3 className="card-title">대여자 정보
            </h3>
            <div className="info-row">
              <span className="info-label">이름</span>
              <span className="info-value">{reservationData.renter.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">국가</span>
              <span className="info-value">{reservationData.renter.country}</span>
            </div>
            <div className="info-row">
              <span className="info-label">이메일</span>
              <span className="info-value">{reservationData.renter.email}</span>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="info-card payment-card">
            <h3 className="card-title">결제 정보
            </h3>
            <div className="payment-row">
              <span className="payment-label">대여료</span>
              <span className="payment-value">{reservationData.payment.rentalFee.toLocaleString()}원</span>
            </div>
            <div className="payment-row">
              <span className="payment-label">보험료</span>
              <span className="payment-value">{reservationData.payment.insurance.toLocaleString()}원</span>
            </div>
            <div className="payment-row">
              <span className="payment-label">보증금</span>
              <span className="payment-value">{reservationData.payment.deposit.toLocaleString()}원</span>
            </div>
            <div className="payment-divider"></div>
            <div className="payment-row total-row">
              <span className="payment-label">총 결제 금액</span>
              <span className="payment-total">{reservationData.payment.total.toLocaleString()}원</span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <button className="settle-button">
            ⚠️ 정산 요청
          </button>
          <button className="chat-button">
            대여자와 채팅
          </button>
        </div>
      </div>
    </div>
  )
}
