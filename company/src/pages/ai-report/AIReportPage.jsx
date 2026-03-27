import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import DisputeService from '../../services/DisputeService'
import ReservationService from '../../services/ReservationService'
import { carPartLabel } from '../../utils/formatId'
import './AIReportPage.css'

const DEFAULT_THRESHOLD = 60

const toPercent = (value) => {
  if (value == null) return 0
  return value <= 1 ? value * 100 : value
}

const formatDateTime = (value) => {
  if (!value) return '-'
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return value
  }
}

export default function AIReportPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState(null)
  const [selectedAfterLogId, setSelectedAfterLogId] = useState(null)
  const [createReason, setCreateReason] = useState('')
  const [createAmount, setCreateAmount] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    fetchAiReport()
  }, [id])

  const fetchAiReport = async () => {
    setLoading(true)
    setError('')
    setCreateError('')

    const modeParam = searchParams.get('mode')
    const isDisputeMode = modeParam === 'dispute'

    let mode = isDisputeMode ? 'dispute' : 'reservation'
    let dispute = null
    let reservationId = id

    if (isDisputeMode) {
      const detailResult = await DisputeService.getDisputeDetail(id)
      if (detailResult.success && detailResult.data) {
        dispute = detailResult.data
        reservationId = detailResult.data.reservationId
      } else {
        setError(detailResult.message || '분쟁 정보를 불러오지 못했습니다.')
        setLoading(false)
        return
      }
    }

    const aiResult = isDisputeMode
      ? await DisputeService.getAiAnalysis(id)
      : { success: false, data: null }
    const reservationResult = await ReservationService.getReservationDetail(reservationId)

    if (!reservationResult.success || !reservationResult.data) {
      setError(reservationResult.message || '예약 정보를 불러오지 못했습니다.')
      setLoading(false)
      return
    }

    const reservation = reservationResult.data
    const carId = reservation?.car?.carId
    if (!carId) {
      setError('차량 식별 정보가 없어 AI 리포트를 생성할 수 없습니다.')
      setLoading(false)
      return
    }

    const returnReportResult = await ReservationService.getReturnReport(carId, reservationId)
    if (!returnReportResult.success || !returnReportResult.data) {
      setError(returnReportResult.message || '반납 리포트를 불러오지 못했습니다.')
      setLoading(false)
      return
    }

    const returnReport = returnReportResult.data
    const threshold = returnReport.similarityThreshold ?? DEFAULT_THRESHOLD

    const comparisonFromReturnReport = Array.isArray(returnReport.comparisons)
      ? returnReport.comparisons
      : []
    const comparisonFromAi = aiResult.success && Array.isArray(aiResult.data?.comparisons)
      ? aiResult.data.comparisons.map((item) => {
          const similarity = toPercent(item.similarity)
          return {
            beforeLogId: item.beforeLogId,
            afterLogId: item.afterLogId,
            beforeCropS3Url: item.beforeCropS3Url,
            afterCropS3Url: item.afterCropS3Url,
            similarity,
            diffScore: item.diffScore,
            warning: similarity < threshold
          }
        })
      : []

    const comparisons = comparisonFromReturnReport.length > 0
      ? comparisonFromReturnReport
      : comparisonFromAi

    const scratches = Array.isArray(returnReport.scratches) ? returnReport.scratches : []
    const afterScratchMap = new Map(
      scratches
        .filter((scratch) => scratch.logType === 'AFTER')
        .map((scratch) => [scratch.logId, scratch])
    )

    const warningCount = Number.isFinite(returnReport.warningCount)
      ? returnReport.warningCount
      : comparisons.filter((item) => item.warning).length

    setReportData({
      dispute,
      mode,
      reservationId,
      reservation,
      threshold,
      scratches,
      comparisons,
      warningCount,
      beforeCount: aiResult.success ? aiResult.data?.beforeCount ?? 0 : 0,
      afterCount: aiResult.success ? aiResult.data?.afterCount ?? 0 : 0,
      afterScratchMap
    })

    setSelectedAfterLogId(dispute?.targetLogId || comparisons[0]?.afterLogId || null)
    setLoading(false)
  }

  const selectedComparison = useMemo(() => {
    if (!reportData) return null
    const matched = reportData.comparisons.find((item) => item.afterLogId === selectedAfterLogId)
    return matched || reportData.comparisons[0] || null
  }, [reportData, selectedAfterLogId])

  const selectedAfterScratch = useMemo(() => {
    if (!reportData || !selectedComparison) return null
    return reportData.afterScratchMap.get(selectedComparison.afterLogId) || null
  }, [reportData, selectedComparison])

  const handleDispute = () => {
    if (reportData?.mode === 'dispute') {
      navigate(`/disputes/${id}`)
      return
    }
    const targetLogId = selectedComparison?.afterLogId
    if (!targetLogId) {
      alert('분쟁 생성 대상 로그가 없습니다.')
      return
    }
    if (!createReason.trim()) {
      alert('분쟁 사유를 입력해 주세요.')
      return
    }
    const claimAmount = Number(createAmount)
    if (!Number.isFinite(claimAmount) || claimAmount <= 0) {
      alert('청구 금액을 1원 이상 입력해 주세요.')
      return
    }

    createDispute(targetLogId, claimAmount)
  }

  const createDispute = async (targetLogId, claimAmount) => {
    setCreateLoading(true)
    setCreateError('')

    const result = await DisputeService.createDispute(reportData.reservationId, {
      targetLogId,
      reason: createReason.trim(),
      claimAmount
    })

    setCreateLoading(false)

    if (!result.success || !result.data) {
      setCreateError(result.message || '분쟁 생성에 실패했습니다.')
      return
    }

    alert('분쟁이 생성되었습니다.')
    navigate(`reservations/${result.data.reservationId}/disputes/${result.data.disputeId}`)
  }

  if (loading) {
    return (
      <div className="ai-report-page">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate(-1)}>←</button>
          <h1 className="page-title">AI 반납 리포트 검토</h1>
        </div>
        <div className="loading-card">AI 리포트를 불러오는 중...</div>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="ai-report-page">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate(-1)}>←</button>
          <h1 className="page-title">AI 반납 리포트 검토</h1>
        </div>
        <div className="error-card">{error || '리포트 데이터가 없습니다.'}</div>
      </div>
    )
  }

  const carInfo = reportData.reservation?.car
  const carPlate = carInfo?.plateNumber || '-'
  const carModel = [carInfo?.brand, carInfo?.modelName].filter(Boolean).join(' ') || '-'
  const warningCount = reportData.warningCount || 0
  const threshold = reportData.threshold
  const hasWarning = warningCount > 0
  const isReservationMode = reportData.mode === 'reservation'

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
              <h2 className="car-plate">{carPlate}</h2>
              {warningCount > 0 && (
                <span className="damage-badge">주의 필요 {warningCount}건</span>
              )}
            </div>
            <p className="car-meta">
              {carModel} | 반납일시: {formatDateTime(reportData.reservation?.returnDate)}
            </p>
          </div>
        </div>
        <div className="deposit-status">
          <p className="status-label">AI 경고 기준</p>
          <p className="status-value">
            <span className="status-icon">{hasWarning ? '⚠️' : '✅'}</span>
            유사도 {threshold.toFixed(1)}% 미만 주의
          </p>
        </div>
      </div>

      {hasWarning && (
        <div className="warning-panel">
          유사도가 기준치보다 낮은 비교가 {warningCount}건 감지되었습니다. 반납 전/후 이미지와 분쟁 대상 로그를 확인하세요.
        </div>
      )}

      <div className="report-content">
        <div className="left-section">
          <div className="damage-map-card">
            <h3 className="section-title">AI 비교 결과</h3>
            <div className="comparison-list">
              {reportData.comparisons.map((item, index) => {
                const afterScratch = reportData.afterScratchMap.get(item.afterLogId)
                const isSelected = selectedComparison?.afterLogId === item.afterLogId
                return (
                  <button
                    key={`${item.afterLogId}-${item.beforeLogId || index}`}
                    className={`comparison-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedAfterLogId(item.afterLogId)}
                  >
                    <div className="comparison-item-title-row">
                      <span className="comparison-item-title">
                        {index + 1}. {carPartLabel(afterScratch?.carPart) || '위치 미상'}
                      </span>
                      <span className={`comparison-item-badge ${item.isNewScratch ? 'new-scratch' : item.warning ? 'warn' : 'safe'}`}>
                        {item.isNewScratch ? '신규 흠집' : item.warning ? '주의' : '정상'}
                      </span>
                    </div>
                  </button>
                )
              })}
              {reportData.comparisons.length === 0 && (
                <p className="empty-message">AI 비교 데이터가 없습니다.</p>
              )}
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot new"></span>
                <span className="legend-text">주의 필요</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot existing"></span>
                <span className="legend-text">기준 이상</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="damage-detail-card">
            <div className="detail-header">
              <h3 className="section-title">
                <span className="warning-icon">{selectedComparison?.warning ? '⚠️' : '✅'}</span>
                {carPartLabel(selectedAfterScratch?.carPart) || '선택된 비교 없음'} 상세
              </h3>
            </div>

            <div className="comparison-images">
              <div className="image-container">
                <p className="image-label">BEFORE</p>
                {selectedComparison?.isNewScratch || !selectedComparison?.beforeCropS3Url ? (
                  <div className="no-before-placeholder">
                    <span className="no-before-icon">🚫</span>
                    <p>{selectedComparison?.isNewScratch ? '사전 스캔 없음' : 'BEFORE 이미지 없음'}</p>
                    <p className="no-before-sub">
                      {selectedComparison?.isNewScratch
                        ? '고객님께서 스캔을 건너뛰었습니다.'
                        : '해당 흠집에 대한 사전 이미지가 존재하지 않습니다.'}
                    </p>
                  </div>
                ) : (
                  <img
                    src={selectedComparison.beforeCropS3Url}
                    alt="Before"
                    className="damage-image"
                  />
                )}
              </div>
              <div className="image-container highlighted">
                <p className="image-label">AFTER</p>
                <img
                  src={selectedComparison?.afterCropS3Url || 'https://via.placeholder.com/400x300?text=No+After'}
                  alt="After"
                  className="damage-image"
                />
              </div>
            </div>

            <div className="similarity-section">
              {selectedComparison?.isNewScratch ? (
                <div className="new-scratch-notice">
                  <p className="new-scratch-title">새로운 흠집으로 분류됨</p>
                  <p className="new-scratch-desc">
                    반납 후 발견된 신규 손상입니다.
                  </p>
                </div>
              ) : (
                <>
                  <div className="similarity-header">
                    <span className="similarity-label">AI 이미지 유사도 (Similarity)</span>
                    <span className="similarity-value">{toPercent(selectedComparison?.similarity).toFixed(1)}%</span>
                  </div>
                  <div className="similarity-bar">
                    <div
                      className="similarity-fill"
                      style={{ width: `${Math.min(100, toPercent(selectedComparison?.similarity))}%` }}
                    ></div>
                  </div>
                  <p className="similarity-description">
                    <span className="info-icon">ℹ️</span>
                    {selectedComparison?.warning
                      ? `유사도가 기준치(${threshold.toFixed(1)}%) 미만입니다. 추가 확인이 필요합니다.`
                      : `유사도가 기준치(${threshold.toFixed(1)}%) 이상입니다.`}
                  </p>
                </>
              )}
            </div>

            <div className="action-buttons">
              <button className="dispute-btn" onClick={handleDispute}>
                {isReservationMode ? '🛠️ 선택 항목으로 분쟁 생성' : '🛠️ 수리비 청구 (분쟁 상세 이동)'}
              </button>
            </div>
            {isReservationMode && (
              <div className="dispute-create-box">
                <p className="dispute-create-title">분쟁 생성 정보</p>
                <textarea
                  className="dispute-input dispute-reason"
                  placeholder="분쟁 사유를 입력해 주세요."
                  value={createReason}
                  onChange={(e) => setCreateReason(e.target.value)}
                />
                <input
                  className="dispute-input"
                  type="number"
                  min="1"
                  placeholder="청구 금액(원)"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                />
                {createError && <p className="create-error">{createError}</p>}
                {createLoading && <p className="create-loading">분쟁 생성 중...</p>}
              </div>
            )}
            <p className="action-note">
              BEFORE {reportData.beforeCount}건 / AFTER {reportData.afterCount}건 분석 완료
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}