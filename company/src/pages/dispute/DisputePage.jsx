import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import DisputeService from '../../services/DisputeService'
import './DisputePage.css'

export default function DisputePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [scratchLogs, setScratchLogs] = useState([])
  const [loadingScratchLogs, setLoadingScratchLogs] = useState(false)

  useEffect(() => {
    // 스크래치 로그 조회
    const fetchScratchLogs = async () => {
      if (!dispute.reservationId) return

      setLoadingScratchLogs(true)
      const result = await DisputeService.getScratchLogs(dispute.reservationId)

      if (result.success) {
        setScratchLogs(result.data)
      } else {
        console.error('스크래치 로그 조회 실패:', result.message)
      }
      setLoadingScratchLogs(false)
    }

    fetchScratchLogs()
  }, [id])

  // 임시 분쟁 상세 데이터 (실제로는 API에서 id로 조회)
  const dispute = {
    id: id,
    disputeId: 'DIS-2024-001',
    reservationId: 'RES-2024-001',
    carName: '소나타 DN8',
    carNumber: '12가 3456',
    carModel: '2023년식',
    renterName: '김철수',
    renterEmail: 'kimcs@example.com',
    issueType: '차량 파손',
    status: 'pending',
    createdDate: '2024-03-15 14:30',
    description: '차량 앞 범퍼에 스크래치가 발견되었습니다. 렌터가 주차 중 발생했다고 주장하나, AI 스캔 결과 충돌 흔적이 확인되었습니다.',
    amount: 500000,
    images: [
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    ],
    aiReportUrl: '/ai-report/001',
    timeline: [
      { date: '2024-03-15 14:30', action: '분쟁 요청', user: '업체' },
      { date: '2024-03-15 14:35', action: '렌터 확인', user: '김철수' },
      { date: '2024-03-15 15:00', action: 'AI 스캔 완료', user: '시스템' },
    ]
  }

  const handleResolve = () => {
    console.log('분쟁 해결:', dispute.id)
    // TODO: API 호출
    alert('분쟁이 해결 처리되었습니다.')
    navigate('/disputes')
  }

  const handleReject = () => {
    console.log('분쟁 반려:', dispute.id)
    // TODO: API 호출
    alert('분쟁이 반려되었습니다.')
    navigate('/disputes')
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
            <span className={`status-badge ${dispute.status}`}>
              {dispute.status === 'pending' ? '처리 중' : '해결 완료'}
            </span>
          </div>
          <div className="status-info">
            <div className="info-item">
              <span className="label">요청일시</span>
              <span className="value">{dispute.createdDate}</span>
            </div>
            <div className="info-item">
              <span className="label">분쟁 금액</span>
              <span className="value amount">{dispute.amount.toLocaleString()}원</span>
            </div>
            <div className="info-item">
              <span className="label">분쟁 유형</span>
              <span className="value">{dispute.issueType}</span>
            </div>
            <div className="info-item">
              <span className="label">렌터 이름</span>
              <span className="value">{dispute.renterName}</span>
            </div>
            <div className="info-item">
              <span className="label">렌터 이메일</span>
              <span className="value">{dispute.renterEmail}</span>
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
                  <span className="value">{dispute.carName}</span>
                </div>
                <div className="info-item">
                  <span className="label">차량 번호</span>
                  <span className="value">{dispute.carNumber}</span>
                </div>
                <div className="info-item">
                  <span className="label">연식</span>
                  <span className="value">{dispute.carModel}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="section-title">분쟁 내용</h2>
              <p className="description">{dispute.description}</p>
            </div>

            {/* Evidence Images */}
            <div className="card">
              <h2 className="section-title">증거 자료</h2>
              <div className="images-grid">
                {dispute.images.map((img, idx) => (
                  <div key={idx} className="image-item">
                    <img src={img} alt={`증거 ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <button
                className="btn btn-outline"
                onClick={() => navigate(dispute.aiReportUrl)}
              >
                AI 스캔 리포트 보기
              </button>
            </div>

            {/* Scratch Logs */}
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
                        <span className="log-date">
                          {new Date(log.createdAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <div className="log-images">
                        {log.originalS3Url && (
                          <div className="log-image-wrapper">
                            <img src={log.originalS3Url} alt="원본 이미지" />
                            <span className="image-label">원본</span>
                          </div>
                        )}
                        {log.cropS3Url && (
                          <div className="log-image-wrapper">
                            <img src={log.cropS3Url} alt="크롭 이미지" />
                            <span className="image-label">크롭</span>
                          </div>
                        )}
                      </div>
                      <div className="log-details">
                        <div className="log-detail-item">
                          <span className="detail-label">좌표:</span>
                          <span className="detail-value">X: {log.coordX}, Y: {log.coordY}</span>
                        </div>
                        {log.proofIpfsCid && (
                          <div className="log-detail-item">
                            <span className="detail-label">IPFS CID:</span>
                            <span className="detail-value ipfs-cid">{log.proofIpfsCid}</span>
                          </div>
                        )}
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
                {dispute.timeline.map((item, idx) => (
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
            {dispute.status === 'pending' && (
              <div className="card actions-card">
                <h2 className="section-title">처리 작업</h2>
                <div className="actions-buttons">
                  <button
                    className="btn btn-danger"
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    분쟁 반려
                  </button>
                  <button
                    className="btn btn-primary"
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
