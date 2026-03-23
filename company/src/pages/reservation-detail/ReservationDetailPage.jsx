import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './ReservationDetailPage.css'

export default function ReservationDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Mock data - replace with API call
  const reservationData = {
    carName: '현대 쏘나타',
    carType: 'SUV · 2024년식',
    plateNumber: '12가 3456',
    status: '분쟁중',
    pickup: {
      date: '2026.02.25 11:00',
      location: '서울 강남구 테헤란로 123',
    },
    dropoff: {
      date: '2026.02.28 11:00',
      location: '서울 강남구 테헤란로 123',
    },
    renter: {
      name: '최지호',
      country: '대한민국',
      phone: '+82-10-1234-5678',
    },
    payment: {
      rentalFee: 240000,
      insurance: 30000,
      deposit: 100000,
      total: 370000,
    },
    defects: {
      pickup: 2,
      dropoff: 4,
      newDefects: 2,
    },
    dispute: {
      reason: '반납 시 새로운 스크래치 발견',
      claimAmount: 150000,
    },
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
              <div className="status-box pickup">
                <div className="status-header">
                  <span className="status-check">
                    <span className="check-icon">✓</span> 픽업
                  </span>
                  <button className="view-photos-btn">
                    <span className="camera-icon">📷</span> 사진 보기
                  </button>
                </div>
                <div className="status-detail">
                  기존 결함: {reservationData.defects.pickup}건 (AI 탐지)
                </div>
              </div>

              {/* 반납 정보 */}
              <div className="status-box return">
                <div className="status-header">
                  <span className="status-check">
                    <span className="check-icon">✓</span> 반납
                  </span>
                  <button className="view-photos-btn">
                    <span className="camera-icon">📷</span> 사진 보기
                  </button>
                </div>
                <div className="status-detail">
                  결함: {reservationData.defects.dropoff}건 (AI 탐지)
                </div>
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
              <span className="info-label">연락처</span>
              <span className="info-value">{reservationData.renter.phone}</span>
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
