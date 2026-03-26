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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false)

  useEffect(() => {
    fetchDisputeDetail()
  }, [id])

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

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '-'
    return new Date(isoDate).toLocaleString('ko-KR')
  }

  const toUiStatus = (status) => {
    if (status === 'COMPLETED' || status === 'RESOLVED') return 'completed'
    return 'open'
  }
  const uiStatus = toUiStatus(dispute?.status)

  const defenseImages = [
    dispute?.defenseOriginalS3Url,
    dispute?.defenseCropS3Url,
  ].filter(Boolean)

  const defenseLog = scratchLogs.find((log) => log.logId === dispute?.defenseLogId)
  const defenseImages = [
    dispute?.defenseOriginalS3Url || defenseLog?.originalS3Url,
    dispute?.defenseCropS3Url || defenseLog?.cropS3Url,
  ].filter(Boolean)

  const timeline = dispute
    ? [
      { date: formatDateTime(dispute.createdAt), action: '분쟁 요청', user: '업체' },
      ...(dispute.defenseLogId ? [{ date: formatDateTime(dispute.updatedAt), action: '렌터 증거 제출', user: '렌터' }] : []),
      { date: formatDateTime(dispute.updatedAt), action: '상태 업데이트', user: '시스템' }
    ]
    : []

  const handleResolve = async () => {
    if (!dispute?.disputeId) return

    setActionLoading(true)
    try {
      const result = await DisputeService.resolveDispute(dispute.disputeId, {
        finalAmount: dispute.claimAmount || 0,
        status: 'COMPLETED',
      })

      if (!result.success) {
        alert(result.message)
        return
      }

      if (result.data?.status !== 'COMPLETED') {
        alert('업체 동의가 등록되었습니다. 상대방 동의를 기다립니다.')
        await fetchDisputeDetail()
      } else {
        alert('분쟁 정산이 완료되었습니다.')
        navigate('/disputes')
      }
    } finally {
      setActionLoading(false)
      setIsResolveModalOpen(false)
    }
  }

  const handleReject = async () => {
    if (!dispute?.disputeId) return

    setActionLoading(true)
    try {
      const result = await DisputeService.resolveDispute(dispute.disputeId, {
        finalAmount: 0,
        status: 'REFUNDED',
      })

      if (!result.success) {
        alert(result.message)
        return
      }

      if (result.data?.status !== 'COMPLETED') {
        alert('렌터 증거 인정으로 동의가 등록되었습니다. 상대방 동의를 기다립니다.')
        await fetchDisputeDetail()
      } else {
        alert('렌터 증거 인정 처리와 정산이 완료되었습니다.')
        navigate('/disputes')
      }
    } finally {
      setActionLoading(false)
      setIsRejectModalOpen(false)
    }
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
              {uiStatus === 'open' ? '접수됨' : '완료'}
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
              <div className="section-title-row">
                <h2 className="section-title">분쟁 내용</h2>
                <button
                  className="btn btn-outline btn-sm ai-report-btn"
                  onClick={() => navigate(`/ai-report/${dispute.disputeId}`)}
                >
                  AI 스캔 리포트 보기
                </button>
              </div>
              <p className="description">{dispute.reason || '-'}</p>
            </div>

            {dispute.defenseLogId && (
              <div className="card">
                <h2 className="section-title">렌터 제출 증거</h2>
                <p className="description defense-description">
                  렌터가 반납 전 흠집 기록을 증거로 제출했습니다. 아래 버튼으로 증거 이미지를 확인할 수 있습니다.
                </p>
                <div className="defense-meta">
                  <span>방어 로그 ID: {dispute.defenseLogId}</span>
                  <span>제출 상태: 확인 필요</span>
                </div>
                <button className="btn btn-outline" onClick={() => setIsDefenseModalOpen(true)}>
                  사용자 제출 증거 이미지 보기
                </button>
                {uiStatus !== 'completed' && (
                  <div className="defense-action-buttons">
                    <button
                      className="btn btn-danger"
                      disabled={actionLoading}
                      onClick={() => setIsRejectModalOpen(true)}
                    >
                      인정
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={actionLoading}
                      onClick={() => setIsResolveModalOpen(true)}
                    >
                      불인정
                    </button>
                  </div>
                )}
              </div>
            )}
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

          </div>
        </div>
      </div>

      {isDefenseModalOpen && (
        <div className="defense-modal-overlay" onClick={() => setIsDefenseModalOpen(false)}>
          <div className="defense-modal" onClick={(event) => event.stopPropagation()}>
            <h3>렌터 제출 증거 이미지</h3>
            <p className="defense-modal-sub">분쟁 ID: {dispute.disputeId}</p>
            <div className="defense-images-grid">
              {defenseImages.length === 0 && <p className="no-data-text">표시할 증거 이미지가 없습니다.</p>}
              {defenseImages.map((imageUrl, index) => (
                <div key={index} className="image-item">
                  <img src={imageUrl} alt={`렌터 증거 ${index + 1}`} />
                </div>
              ))}
            </div>
            <div className="defense-modal-actions">
              <button className="btn btn-outline" onClick={() => setIsDefenseModalOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      <ConfirmModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={handleResolve}
        title="렌터 제출 증거를 불인정하시겠습니까?"
        message="업체 동의로 정산 프로세스를 진행합니다. 상대방 동의까지 완료되면 스마트 컨트랙트가 실행됩니다."
        confirmText="불인정"
        cancelText="취소하기"
        confirmButtonStyle="primary"
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="렌터 제출 증거를 인정하시겠습니까?"
        message="증거 인정으로 정산 동의가 진행되며, 상대방 동의까지 완료되면 스마트 컨트랙트가 실행됩니다."
        confirmText="인정"
        cancelText="취소하기"
        confirmButtonStyle="danger"
      />
    </div>
  )
}
