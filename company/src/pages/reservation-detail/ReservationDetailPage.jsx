import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import SuccessModal from '../../components/SuccessModal'
import './ReservationDetailPage.css'

export default function ReservationDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // 상태 관리
  const [isDisputing, setIsDisputing] = useState(false) // 분쟁 중 여부
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false) // 분쟁 요청 확인 모달
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false) // 분쟁 요청 성공 모달
  const [showPickupPhotos, setShowPickupPhotos] = useState(false) // 픽업 사진 표시
  const [showDropoffPhotos, setShowDropoffPhotos] = useState(false) // 반납 사진 표시

  // Mock data - replace with API call
  const reservationData = {
    carName: '현대 쏘나타',
    carType: 'SUV · 2024년식',
    plateNumber: '12가 3456',
    status: isDisputing ? '분쟁중' : '이용완료',
    pickup: {
      date: '2026.02.25 11:00',
      location: '서울 강남구 테헤란로 123',
      photos: [
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
      ]
    },
    dropoff: {
      date: '2026.02.28 11:00',
      location: '서울 강남구 테헤란로 123',
      photos: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      ]
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
    dispute: isDisputing ? {
      reason: '반납 시 새로운 스크래치 발견',
      claimAmount: 150000,
    } : null,
  }

  // 분쟁 요청 핸들러
  const handleDisputeRequest = () => {
    setIsConfirmModalOpen(true)
  }

  // 분쟁 요청 확인
  const handleConfirmDispute = () => {
    setIsConfirmModalOpen(false)
    // TODO: API 호출
    setIsDisputing(true)
    setIsSuccessModalOpen(true)
  }

  // 성공 모달 닫기
  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false)
    // 페이지는 그대로 유지 (분쟁 중 상태로 표시됨)
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
            {reservationData.status === '분쟁중' ? '⚠️ ' : ''}{reservationData.status}
          </span>
        )}
      </div>

      <h2 className="car-title">{reservationData.carName}</h2>

      <div className="detail-content">
        <div className="left-column">
          {/* 차량 정보 */}
          <div className="info-card">
            <h3 className="card-title">차량 정보</h3>
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
            <h3 className="card-title">이용 상태</h3>
            <div className="usage-status">
              {/* 픽업 */}
              <div className="status-item">
                <div className="status-header">
                  <span className="status-check">✓ 픽업</span>
                  <button
                    className="view-photos-btn"
                    onClick={() => setShowPickupPhotos(!showPickupPhotos)}
                  >
                    {showPickupPhotos ? '사진 숨기기' : '사진 보기'}
                  </button>
                </div>
                <div className="status-detail">기존 결함: {reservationData.defects.pickup}건 (AI 탐지)</div>

                {showPickupPhotos && (
                  <div className="photos-grid">
                    {reservationData.pickup.photos.map((photo, idx) => (
                      <div key={idx} className="photo-item">
                        <img src={photo} alt={`픽업 사진 ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 반납 */}
              <div className="status-item">
                <div className="status-header">
                  <span className="status-check">✓ 반납</span>
                  <button
                    className="view-photos-btn"
                    onClick={() => setShowDropoffPhotos(!showDropoffPhotos)}
                  >
                    {showDropoffPhotos ? '사진 숨기기' : '사진 보기'}
                  </button>
                </div>
                <div className="status-detail">결함: {reservationData.defects.dropoff}건 (AI 탐지)</div>

                {showDropoffPhotos && (
                  <div className="photos-grid">
                    {reservationData.dropoff.photos.map((photo, idx) => (
                      <div key={idx} className="photo-item">
                        <img src={photo} alt={`반납 사진 ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {reservationData.defects.newDefects > 0 && (
              <div className="defect-alert">
                ⚠️ 새로운 결함 {reservationData.defects.newDefects}건 발견
              </div>
            )}

            {/* 분쟁 요청 버튼 */}
            {!isDisputing && reservationData.defects.newDefects > 0 && (
              <button
                className="dispute-request-button"
                onClick={handleDisputeRequest}
              >
                분쟁 요청
              </button>
            )}
          </div>

          {/* 분쟁 정보 */}
          {reservationData.dispute && (
            <div className="info-card dispute-card">
              <h3 className="card-title dispute-title">
                <span className="icon">⚠️</span> 분쟁 정보
              </h3>
              <div className="dispute-content">
                <div className="dispute-row">
                  <span className="dispute-label">분쟁 사유</span>
                  <span className="dispute-reason">{reservationData.dispute.reason}</span>
                </div>
                <div className="dispute-row">
                  <span className="dispute-label">청구 금액</span>
                  <span className="dispute-amount">{reservationData.dispute.claimAmount.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="right-column">
          {/* 대여자 정보 */}
          <div className="info-card">
            <h3 className="card-title">대여자 정보</h3>
            <div className="info-row">
              <span className="info-label">이름</span>
              <span className="info-value">{reservationData.renter.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">국가</span>
              <span className="info-value">{reservationData.renter.country}</span>
            </div>

          </div>

          {/* 결제 정보 */}
          <div className="info-card payment-card">
            <h3 className="card-title">결제 정보</h3>
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

      {/* 분쟁 요청 확인 모달 */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDispute}
        title="분쟁을 요청하시겠습니까?"
        message="분쟁을 요청하면 고객에게 알림이 전송돼요."
        confirmText="요청하기"
        cancelText="취소하기"
        confirmButtonStyle="danger"
      />

      {/* 분쟁 요청 성공 모달 */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        title="분쟁이 요청되었습니다"
        message="분쟁 요청이 성공적으로 처리되었습니다. 고객에게 알림이 전송되었습니다."
        buttonText="확인"
      />
    </div>
  )
}
