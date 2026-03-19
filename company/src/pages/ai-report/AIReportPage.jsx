import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './AIReportPage.css'

export default function AIReportPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Mock data - replace with API call
  const reportData = {
    carPlate: '12허 3456',
    newDamageCount: 1,
    carModel: '현대 아이오닉 CN7',
    rentalEndDate: '대여 종료일',
    returnDateTime: '2026.03.12 14:00',
    depositStatus: '완전 100% 반납 대기 중',
    damageLocations: [
      { id: 1, type: 'existing', position: { top: '30%', left: '50%' } },
      { id: 2, type: 'bidirectional', position: { top: '60%', left: '75%' } },
      { id: 3, type: 'new', position: { top: '50%', left: '60%' } },
    ],
    selectedDamage: {
      location: '조수석 앞문 (Front Right Door)',
      beforeImage: 'https://via.placeholder.com/400x300?text=Before',
      beforeTime: '대여 전 (3/10 10:00)',
      afterImage: 'https://via.placeholder.com/400x300?text=After',
      afterTime: '반납 후 (3/12 14:00)',
      similarity: 12.4,
      description:
        'AI 모델 대비 약 기준값 이상 새로운 스크래치가 감지되었습니다. 추가 확인이 필요합니다.',
    },
  }

  const handleApprove = () => {
    console.log('Approve clicked')
    // API call to approve
  }

  const handleDispute = () => {
    console.log('Dispute clicked')
    // Navigate to dispute creation page
  }

  const handleDownloadIPFS = () => {
    console.log('Download IPFS clicked')
    // Download from IPFS
  }

  return (
    <div className="ai-report-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="page-title">AI 반납 리포트 검토</h1>
        <div className="user-info">
          <span>관리자님, 환영합니다</span>
          <span className="user-icon">👤</span>
        </div>
      </div>

      <div className="report-header">
        <div className="car-info">
          <div className="car-details">
            <div className="car-plate-row">
              <h2 className="car-plate">{reportData.carPlate}</h2>
              {reportData.newDamageCount > 0 && (
                <span className="damage-badge">⚠️ 신규 파손 위치 {reportData.newDamageCount}건</span>
              )}
            </div>
            <p className="car-meta">
              {reportData.carModel} | {reportData.rentalEndDate} | 반납 일시: {reportData.returnDateTime}
            </p>
          </div>
        </div>
        <div className="deposit-status">
          <p className="status-label">스마트 컨트랙트 보증금 상태</p>
          <p className="status-value">
            <span className="status-icon">✅</span> {reportData.depositStatus}
          </p>
        </div>
      </div>

      <div className="report-content">
        <div className="left-section">
          <div className="damage-map-card">
            <h3 className="section-title">AI 탐지 위치 (번호)</h3>
            <div className="car-diagram">
              <div className="car-outline">
                {reportData.damageLocations.map((damage) => (
                  <div
                    key={damage.id}
                    className={`damage-marker ${damage.type}`}
                    style={{ top: damage.position.top, left: damage.position.left }}
                  >
                    {damage.id}
                  </div>
                ))}
              </div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot existing"></span>
                <span className="legend-text">기존 손상</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bidirectional"></span>
                <span className="legend-text">양방향</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot new"></span>
                <span className="legend-text">신규 파손</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="damage-detail-card">
            <div className="detail-header">
              <h3 className="section-title">
                <span className="warning-icon">⚠️</span> {reportData.selectedDamage.location} 상세
              </h3>
              <button className="ipfs-download-btn" onClick={handleDownloadIPFS}>
                IPFS 다운 다기 중
              </button>
            </div>

            <div className="comparison-images">
              <div className="image-container">
                <p className="image-label">{reportData.selectedDamage.beforeTime}</p>
                <img
                  src={reportData.selectedDamage.beforeImage}
                  alt="Before"
                  className="damage-image"
                />
              </div>
              <div className="image-container highlighted">
                <p className="image-label">{reportData.selectedDamage.afterTime}</p>
                <img
                  src={reportData.selectedDamage.afterImage}
                  alt="After"
                  className="damage-image"
                />
              </div>
            </div>

            <div className="similarity-section">
              <div className="similarity-header">
                <span className="similarity-label">AI 이미지 유사도 (Similarity)</span>
                <span className="similarity-value">{reportData.selectedDamage.similarity}%</span>
              </div>
              <div className="similarity-bar">
                <div
                  className="similarity-fill"
                  style={{ width: `${reportData.selectedDamage.similarity}%` }}
                ></div>
              </div>
              <p className="similarity-description">
                <span className="info-icon">ℹ️</span> {reportData.selectedDamage.description}
              </p>
            </div>

            <div className="action-buttons">
              <button className="approve-btn" onClick={handleApprove}>
                ✓ 정상 승인 (완전성)
              </button>
              <button className="dispute-btn" onClick={handleDispute}>
                🛠️ 수리비 청구 (분쟁 제기)
              </button>
            </div>
            <p className="action-note">두 가지 버튼 중 하나를 선택해 진행하세요. Lock 해제와 진행됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
