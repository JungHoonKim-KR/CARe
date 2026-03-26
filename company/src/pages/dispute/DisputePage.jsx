import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import DisputeService from '../../services/DisputeService'
import './DisputePage.css'

export default function DisputePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false)
  const [dispute, setDispute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // 여기는 하드코딩 — API 실패 시 폴백
  const MOCK_DETAIL = {
    disputeId: id.includes('DSP') ? id : 'DSP-2603-01',
    reservationId: 'RES-2603-05',
    claimAmount: 350000,
    status: 'OPEN',
    createdAt: '2026-03-26T10:30:00Z',
    reason: '고객 반납 후 차량 우측 범퍼 하단에 심각한 긁힘 및 도장 벗겨짐이 발견되었습니다.',
    defenseLogId: 'LOG-9912',
    defenseOriginalS3Url: 'https://via.placeholder.com/600x400?text=Customer+Proof+1',
    defenseCropS3Url: 'https://via.placeholder.com/600x400?text=Customer+Proof+2',
  }

  useEffect(() => {
    fetchDisputeDetail()
  }, [id])

  const fetchDisputeDetail = async () => {
    setLoading(true)
    try {
      const result = await DisputeService.getDisputeDetail(id)
      setDispute(result.success && result.data ? result.data : MOCK_DETAIL)
    } catch {
      setDispute(MOCK_DETAIL)
    } finally {
      setLoading(false)
    }
  }

  // 불인정 — 청구금액 전액 청구 (COMPLETED)
  const handleResolve = async () => {
    setActionLoading(true)
    try {
      const result = await DisputeService.resolveDispute(id, {
        finalAmount: dispute.claimAmount,
        status: 'COMPLETED',
      })
      if (result.success) {
        navigate('/disputes')
      } else {
        alert(result.message || '정산 처리에 실패했습니다.')
      }
    } catch {
      alert('정산 처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(false)
      setIsResolveModalOpen(false)
    }
  }

  // 무과실 인정 — 청구 취소 (REFUNDED, 0원)
  const handleReject = async () => {
    setActionLoading(true)
    try {
      const result = await DisputeService.rejectDispute(id, '')
      if (result.success) {
        navigate('/disputes')
      } else {
        alert(result.message || '처리에 실패했습니다.')
      }
    } catch {
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(false)
      setIsRejectModalOpen(false)
    }
  }

  const formatDateTime = (iso) => iso ? new Date(iso).toLocaleString('ko-KR') : '-'
  const uiStatus = dispute?.status === 'COMPLETED' || dispute?.status === 'RESOLVED' ? 'completed' : 'open'
  const defenseImages = [dispute?.defenseOriginalS3Url, dispute?.defenseCropS3Url].filter(Boolean)

  const timeline = dispute ? [
    { date: formatDateTime(dispute.createdAt), action: '분쟁 접수 (업체)', user: '시스템' },
    ...(dispute.defenseLogId ? [{ date: formatDateTime(dispute.createdAt), action: '반납 증거 제출 (렌터)', user: '렌터' }] : []),
    { date: '진행 중', action: '업체 확인 대기', user: '업체' }, // 여기는 하드코딩 — 타임라인 마지막 항목 고정
  ] : []

  if (loading || !dispute) return <div className="dp-page"><div className="loading-spinner"></div></div>

  return (
    <div className="dp-page">
      <div className="dp-header-card">
        <button className="dp-back-btn" onClick={() => navigate(-1)}>← 뒤로</button>
        <div className="dp-header-info">
          <div className="dp-header-meta">분쟁 제어 패널 • {dispute.reservationId}</div>
          <h1 className="dp-title">{dispute.disputeId}</h1>
        </div>
        <div className={`dp-status-mega ${uiStatus}`}>
          {uiStatus === 'open' ? '처리 대기중' : '해결 완료됨'}
        </div>
      </div>

      <div className="dp-grid">
        <div className="dp-main-col">
          <div className="dp-card dp-amount-card">
            <div className="dp-amount-label">청구 금액</div>
            <div className="dp-amount-value">{(dispute.claimAmount || 0).toLocaleString()}<span className="unit">원</span></div>
            <p className="dp-amount-desc">파손/수리로 인해 업체가 청구한 보상 금액입니다.</p>
          </div>

          <div className="dp-card">
            <div className="dp-card-header">
              <h2 className="dp-card-title">분쟁 상세 내용</h2>
              <button className="dp-btn-outline" onClick={() => navigate(`/ai-report/${dispute.disputeId}`)}>🤖 AI 리포트 보기</button>
            </div>
            <div className="dp-reason-box">
              {dispute.reason || '입력된 상세 내용이 없습니다.'}
            </div>
          </div>

          {dispute.defenseLogId && (
            <div className="dp-card dp-action-card">
              <h2 className="dp-card-title text-red">🚨 렌터 이의 제기 수신</h2>
              <p className="dp-desc">렌터가 본인의 과실이 아님을 증명하는 반납 전 이미지를 제출했습니다. 이미지를 확인하고 정산 진행 여부를 결정하세요.</p>

              <button className="dp-btn-block" onClick={() => setIsDefenseModalOpen(true)}>
                📸 제출된 증거 이미지 확인
              </button>

              {uiStatus !== 'completed' && (
                <div className="dp-action-row">
                  <button
                    className="dp-btn-danger"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={actionLoading}
                  >
                    렌터 무과실 인정 (청구 취소)
                  </button>
                  <button
                    className="dp-btn-primary"
                    onClick={() => setIsResolveModalOpen(true)}
                    disabled={actionLoading}
                  >
                    불인정 (강제 청구 진행)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dp-side-col">
          <div className="dp-card">
            <h2 className="dp-card-title">진행 타임라인</h2>
            <div className="dp-timeline">
              {timeline.map((item, idx) => (
                <div key={idx} className="dp-tl-item">
                  <div className="dp-tl-dot"></div>
                  <div className="dp-tl-content">
                    <div className="dp-tl-action">{item.action}</div>
                    <div className="dp-tl-meta">{item.date} • {item.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isDefenseModalOpen && (
        <div className="dp-modal-overlay" onClick={() => setIsDefenseModalOpen(false)}>
          <div className="dp-modal" onClick={e => e.stopPropagation()}>
            <h3 className="dp-modal-title">렌터 제출 증거</h3>
            <div className="dp-modal-grid">
              {defenseImages.map((url, i) => (
                <img key={i} src={url} alt="증거" className="dp-proof-img" />
              ))}
            </div>
            <button className="dp-btn-block" onClick={() => setIsDefenseModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={handleResolve}
        title="강제 청구 진행"
        message={`렌터의 이의를 인정하지 않고 청구금액 ${(dispute.claimAmount || 0).toLocaleString()}원을 청구합니다.`}
        confirmText={actionLoading ? '처리 중...' : '확인'}
      />

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="청구 취소"
        message="렌터의 무과실을 인정하고 청구를 취소합니다."
        confirmText={actionLoading ? '처리 중...' : '확인'}
      />
    </div>
  )
}
