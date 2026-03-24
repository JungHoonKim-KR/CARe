import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarService from '../../services/CarService'
import DisputeService from '../../services/DisputeService'
import './AIReportPage.css'

export default function AIReportPage() {
  const navigate = useNavigate()
  const { id } = useParams() // carId
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReturnReport()
  }, [id])

  const fetchReturnReport = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await CarService.getReturnReport(id)

      if (result.success) {
        // API 데이터를 UI 형식으로 변환
        const data = result.data
        setReportData({
          reservationId: data.reservationId,
          carId: data.carId,
          scratches: data.scratches,
          // TODO: 차량 정보는 별도 API 호출 필요
          carPlate: '차량번호',
          carModel: '차량 모델',
          newDamageCount: data.scratches.filter(s => s.isDisputed).length,
        })
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('반납 리포트 조회 에러:', err)
      setError('반납 리포트를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="ai-report-page">
        <div className="loading-container">
          <p>반납 리포트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ai-report-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>돌아가기</button>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return null
  }

  // 스크래치 데이터를 UI용 손상 위치로 변환
  const damageLocations = reportData.scratches.map((scratch, index) => ({
    id: index + 1,
    type: scratch.isDisputed ? 'new' : 'existing',
    position: {
      top: `${scratch.coordY * 100}%`,
      left: `${scratch.coordX * 100}%`
    },
    scratch: scratch
  }))

  // 첫 번째 신규 손상을 선택 (없으면 첫 번째 스크래치)
  const selectedScratch = reportData.scratches.find(s => s.isDisputed) || reportData.scratches[0]

  const displayData = {
    carPlate: reportData.carPlate,
    newDamageCount: reportData.newDamageCount,
    carModel: reportData.carModel,
    rentalEndDate: '대여 종료일',
    returnDateTime: new Date().toLocaleString('ko-KR'),
    depositStatus: '보증금 상태 확인 중',
    damageLocations: damageLocations,
    selectedDamage: selectedScratch ? {
      location: selectedScratch.carPart,
      beforeImage: selectedScratch.logType === 'BEFORE' ? selectedScratch.originalS3Url : 'https://via.placeholder.com/400x300?text=Before',
      beforeTime: selectedScratch.logType === 'BEFORE' ? new Date(selectedScratch.createdAt).toLocaleString('ko-KR') : '대여 전',
      afterImage: selectedScratch.logType === 'AFTER' ? selectedScratch.originalS3Url : selectedScratch.cropS3Url,
      afterTime: new Date(selectedScratch.createdAt).toLocaleString('ko-KR'),
      similarity: 12.4,
      description: selectedScratch.isDisputed
        ? 'AI 모델 대비 약 기준값 이상 새로운 스크래치가 감지되었습니다. 추가 확인이 필요합니다.'
        : '기존 손상으로 확인되었습니다.',
    } : null,
  }

  const handleApprove = () => {
    console.log('Approve clicked')
    // API call to approve
  }

  const handleDispute = async () => {
    if (!reportData || !reportData.reservationId) {
      alert('예약 정보를 찾을 수 없습니다.')
      return
    }

    // Find the first disputed scratch to use as targetLogId
    const disputedScratch = reportData.scratches.find(s => s.isDisputed)
    if (!disputedScratch) {
      alert('분쟁 대상 스크래치를 찾을 수 없습니다.')
      return
    }

    // Prompt user for dispute details
    const reason = window.prompt('분쟁 사유를 입력하세요:')
    if (!reason) return

    const claimAmountStr = window.prompt('청구 금액을 입력하세요:')
    if (!claimAmountStr) return

    const claimAmount = parseInt(claimAmountStr, 10)
    if (isNaN(claimAmount) || claimAmount <= 0) {
      alert('유효한 금액을 입력하세요.')
      return
    }

    // Create dispute
    const result = await DisputeService.createDispute(reportData.reservationId, {
      targetLogId: disputedScratch.scratchLogId,
      reason,
      claimAmount
    })

    if (result.success) {
      alert('분쟁이 성공적으로 제기되었습니다.')
      navigate('/disputes')
    } else {
      alert(result.message || '분쟁 제기에 실패했습니다.')
    }
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
              <h2 className="car-plate">{displayData.carPlate}</h2>
              {displayData.newDamageCount > 0 && (
                <span className="damage-badge">⚠️ 신규 파손 위치 {displayData.newDamageCount}건</span>
              )}
            </div>
            <p className="car-meta">
              {displayData.carModel} | {displayData.rentalEndDate} | 반납 일시: {displayData.returnDateTime}
            </p>
          </div>
        </div>
        <div className="deposit-status">
          <p className="status-label">스마트 컨트랙트 보증금 상태</p>
          <p className="status-value">
            <span className="status-icon">✅</span> {displayData.depositStatus}
          </p>
        </div>
      </div>

      <div className="report-content">
        <div className="left-section">
          <div className="damage-map-card">
            <h3 className="section-title">AI 탐지 위치 (번호)</h3>
            <div className="car-diagram">
              <div className="car-outline">
                {displayData.damageLocations.map((damage) => (
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
            {displayData.selectedDamage && (
              <>
                <div className="detail-header">
                  <h3 className="section-title">
                    <span className="warning-icon">⚠️</span> {displayData.selectedDamage.location} 상세
                  </h3>
                  <button className="ipfs-download-btn" onClick={handleDownloadIPFS}>
                    IPFS 다운로드
                  </button>
                </div>

                <div className="comparison-images">
                  <div className="image-container">
                    <p className="image-label">{displayData.selectedDamage.beforeTime}</p>
                    <img
                      src={displayData.selectedDamage.beforeImage}
                      alt="Before"
                      className="damage-image"
                    />
                  </div>
                  <div className="image-container highlighted">
                    <p className="image-label">{displayData.selectedDamage.afterTime}</p>
                    <img
                      src={displayData.selectedDamage.afterImage}
                      alt="After"
                      className="damage-image"
                    />
                  </div>
                </div>

                <div className="similarity-section">
                  <div className="similarity-header">
                    <span className="similarity-label">AI 이미지 유사도 (Similarity)</span>
                    <span className="similarity-value">{displayData.selectedDamage.similarity}%</span>
                  </div>
                  <div className="similarity-bar">
                    <div
                      className="similarity-fill"
                      style={{ width: `${displayData.selectedDamage.similarity}%` }}
                    ></div>
                  </div>
                  <p className="similarity-description">
                    <span className="info-icon">ℹ️</span> {displayData.selectedDamage.description}
                  </p>
                </div>
              </>
            )}

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
