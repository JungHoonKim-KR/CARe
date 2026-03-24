import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import DisputeService from '../../services/DisputeService'
import './DisputePage.css'

export default function DisputePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [dispute, setDispute] = useState(null)
  const [scratchLogs, setScratchLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingScratchLogs, setLoadingScratchLogs] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchDisputeDetail()
  }, [id])

  useEffect(() => {
    fetchScratchLogs()
  }, [dispute?.reservationId])

  const fetchDisputeDetail = async () => {
    setLoading(true)
    setError('')

    const result = await DisputeService.getDisputeDetail(id)
    if (!result.success) {
      setError(result.message)
      setLoading(false)
      return
    }

    setDispute(result.data)
    setLoading(false)
  }

  const fetchScratchLogs = async () => {
    if (!dispute?.reservationId) return

    setLoadingScratchLogs(true)
    const result = await DisputeService.getScratchLogs(dispute.reservationId)

    if (result.success) {
      setScratchLogs(result.data || [])
    } else {
      console.error('스크래치 로그 조회 실패:', result.message)
      setScratchLogs([])
    }
    setLoadingScratchLogs(false)
  }

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleString('ko-KR')
  }

  const uiStatus = dispute?.status === 'RESOLVED' ? 'resolved' : 'pending'

  const evidenceImages = scratchLogs
    .filter((log) => log.logId === dispute?.targetLogId || log.logId === dispute?.defenseLogId)
    .flatMap((log) => [log.originalS3Url, log.cropS3Url].filter(Boolean))

  const timeline = dispute
    ? [
      { date: formatDateTime(dispute.createdAt), action: '분쟁 요청', user: '업체' },
      { date: formatDateTime(dispute.updatedAt), action: '상태 업데이트', user: '시스템' }
    ]
    : []

  const handleResolve = async () => {
    if (!dispute?.disputeId) return

    setActionLoading(true)
    const result = await DisputeService.resolveDispute(dispute.disputeId, {
      finalAmount: dispute.claimAmount || 0,
      status: 'COMPLETED'
    })
    setActionLoading(false)

    if (!result.success) {
      alert(result.message || '분쟁 해결 처리에 실패했습니다.')
      return
    }

    alert('분쟁 해결 요청이 반영되었습니다. 상대 동의가 완료되면 최종 정산됩니다.')
    setIsResolveModalOpen(false)
    fetchDisputeDetail()
  }

  const handleReject = async () => {
    if (!dispute?.disputeId) return

    setActionLoading(true)
    const result = await DisputeService.rejectDispute(dispute.disputeId)
    setActionLoading(false)

    if (!result.success) {
      alert(result.message || '분쟁 반려 처리에 실패했습니다.')
      return
    }

    alert('분쟁 반려 요청이 반영되었습니다. 상대 동의가 완료되면 최종 정산됩니다.')
    setIsRejectModalOpen(false)
    fetchDisputeDetail()
  }

  if (loading) {
    return (
      <div className="dispute-page">
        <div className="empty-state">
          <p>분쟁 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !dispute) {
    return (
      <div className="dispute-page">
        <div className="empty-state">
          <p>{error || '분쟁 정보를 불러오지 못했습니다.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dispute-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="header-content">
          <h1 className="page-title">분쟁 상세</h1>
          <p className="page-subtitle">분쟁 번호: {dispute.disputeId}</p>
        </div>
      </div>

      <div className="dispute-detail-content">
        {/* Status Card */}
        <div className="status-section card">
          <div className="status-header">
            <h2 className="section-title">분쟁 상태</h2>
            <span className={`status-badge ${uiStatus}`}>
              {uiStatus === 'pending' ? '처리 중' : '해결 완료'}
            </span>
          </div>
          <div className="status-info">
            <div className="info-item">
              <span className="label">요청일시</span>
              <span className="value">{formatDateTime(dispute.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="label">분쟁 금액</span>
              <span className="value amount">{(dispute.claimAmount || 0).toLocaleString()}원</span>
            </div>
            <div className="info-item">
              <span className="label">분쟁 유형</span>
              <span className="value">차량 파손</span>
            </div>
            <div className="info-item">
              <span className="label">렌터 이름</span>
              <span className="value">-</span>
            </div>
            <div className="info-item">
              <span className="label">렌터 이메일</span>
              <span className="value">-</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="detail-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Reservation Info */}
            <div className="card">
              <h2 className="section-title">예약 정보</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">예약 번호</span>
                  <span className="value">{dispute.reservationId}</span>
                </div>
                <div className="info-item">
                  <span className="label">차량명</span>
                  <span className="value">-</span>
                </div>
                <div className="info-item">
                  <span className="label">차량 번호</span>
                  <span className="value">-</span>
                </div>
                <div className="info-item">
                  <span className="label">연식</span>
                  <span className="value">-</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="section-title">분쟁 내용</h2>
              <p className="description">{dispute.reason || '-'}</p>
            </div>

            {/* Evidence Images */}
            <div className="card">
              <h2 className="section-title">증거 자료</h2>
              <div className="images-grid">
                {evidenceImages.map((img, idx) => (
                  <div key={idx} className="image-item">
                    <img src={img} alt={`증거 ${idx + 1}`} />
                  </div>
                ))}
                {evidenceImages.length === 0 && <p className="no-data-text">증거 이미지가 없습니다.</p>}
              </div>
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/ai-report/${dispute.disputeId}`)}
              >
                AI 스캔 리포트 보기
              </button>
            </div>

            <div className="card">
              <h2 className="section-title">스크래치 로그 ({scratchLogs.length}건)</h2>
              {loadingScratchLogs ? (
                <p className="loading-text">스크래치 로그를 불러오는 중...</p>
              ) : scratchLogs.length === 0 ? (
                <p className="no-data-text">스크래치 로그가 없습니다.</p>
              ) : (
                <div className="scratch-logs-list">
                  {scratchLogs.map((log) => (
                    <div key={log.logId} className="scratch-log-item">
                      <div className="log-header">
                        <div className="log-info">
                          <span className="log-type">{log.logType}</span>
                          <span className="log-part">{log.carPart}</span>
                          {log.isDisputed && <span className="log-badge disputed">분쟁</span>}
                          {log.isManual && <span className="log-badge manual">수동</span>}
                        </div>
                        <span className="log-date">{formatDateTime(log.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Timeline */}
            <div className="card">
              <h2 className="section-title">처리 내역</h2>
              <div className="timeline">
                {timeline.map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-action">{item.action}</div>
                      <div className="timeline-meta">
                        <span className="timeline-user">{item.user}</span>
                        <span className="timeline-date">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {uiStatus === 'pending' && (
              <div className="card actions-card">
                <h2 className="section-title">처리 작업</h2>
                <div className="actions-buttons">
                  <button
                    className="btn btn-danger"
                    disabled={actionLoading}
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    분쟁 반려
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={actionLoading}
                    onClick={() => setIsResolveModalOpen(true)}
                  >
                    분쟁 해결
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <ConfirmModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={handleResolve}
        title="분쟁을 해결하시겠습니까?"
        message="분쟁을 해결하면 렌터에게 알림이 전송되고 금액이 청구됩니다."
        confirmText="해결하기"
        cancelText="취소하기"
        confirmButtonStyle="primary"
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="분쟁을 반려하시겠습니까?"
        message="분쟁을 반려하면 렌터에게 알림이 전송됩니다."
        confirmText="반려하기"
        cancelText="취소하기"
        confirmButtonStyle="danger"
      />
    </div>
  )
}
