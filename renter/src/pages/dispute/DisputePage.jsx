import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import careLogo from '../../assets/care_logo.png'
import { getDisputeDetail, settleDispute, getCarScratches } from '../../api/reservation'
import './DisputePage.css'

const LOCATION_LABELS = {
  FRONT: '전면부', front: '전면부',
  REAR: '후면부',  rear: '후면부',
  LEFT: '좌측',   left: '좌측',
  RIGHT: '우측',  right: '우측',
  ROOF: '루프',
  HOOD: '보닛',
}

const STATUS_LABELS = {
  OPEN: '분쟁 신청됨',
  COMPLETED: '완료됨',
  REJECTED: '기각됨',
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DisputePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const reservation = state?.reservation
  const disputeId = state?.disputeId

  const [dispute, setDispute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [settling, setSettling] = useState(false)
  const [scratchZone, setScratchZone] = useState(null)
  const [settledResult, setSettledResult] = useState(null) // 정산 완료 결과

  useEffect(() => {
    const reservationId = reservation?.reservationId
    if (!reservationId || !disputeId) return

    setLoading(true)
    getDisputeDetail(reservationId, disputeId)
      .then((data) => {
        setDispute(data)
        setError(null)
      })
      .catch((err) => {
        console.error('분쟁 상세 조회 실패:', err)
        setError('분쟁 정보를 불러오지 못했어요.')
      })
      .finally(() => setLoading(false))
  }, [reservation?.reservationId, disputeId])

  useEffect(() => {
    if (!dispute?.targetLogId || !reservation?.reservationId) return
    getCarScratches(reservation.reservationId)
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data || []
        const match = list.find(s => s.logId === dispute.targetLogId || s.scratchId === dispute.targetLogId)
        if (match) setScratchZone(match.zone || match.location || null)
      })
      .catch(() => {})
  }, [dispute?.targetLogId, reservation?.reservationId])

  const handleSettle = async () => {
    if (!dispute?.disputeId) {
      alert('분쟁 정보가 없어서 정산 동의를 진행할 수 없어요.')
      return
    }

    const finalAmount = dispute.settlementFinalAmount ?? dispute.claimAmount ?? 0
    const settlementStatus = dispute.settlementStatus ?? 'COMPLETED'

    setSettling(true)
    try {
      const result = await settleDispute(dispute.disputeId, finalAmount, settlementStatus)

      if (reservation?.reservationId) {
        localStorage.removeItem(`disputePending_${reservation.reservationId}`)
        localStorage.removeItem(`disputeDate_${reservation.reservationId}`)
      }

      setSettledResult({
        status: result?.status,
        finalAmount,
        isRefunded: result?.status === 'REFUNDED' || settlementStatus === 'REFUNDED',
      })
    } catch (settleError) {
      console.error('분쟁 정산 동의 실패:', settleError)
      alert(settleError?.response?.data?.message || '정산 동의 처리에 실패했어요.')
    } finally {
      setSettling(false)
    }
  }

  const handleDispute = () => {
    navigate('/dispute-scratch-logs', { state: { reservation, disputeId } })
  }

  // 이미 완료된 분쟁이거나 방금 정산 동의한 경우 → 완료 화면
  const isSettled = settledResult || ['COMPLETED', 'RESOLVED', 'REFUNDED'].includes(dispute?.status)
  const isRefunded = settledResult?.isRefunded || dispute?.settlementStatus === 'REFUNDED'
  const resolvedAmount = settledResult?.finalAmount ?? dispute?.settlementFinalAmount ?? dispute?.claimAmount ?? 15000

  if (isSettled) {
    return (
      <div className="dp-page">
        <header className="dp-header">
          <button className="dp-back" onClick={() => navigate(-1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <img src={careLogo} alt="CARe" className="dp-logo" />
          <div style={{ width: 38 }} />
        </header>

        <div className="dp-settled-wrap">
          <div className="dp-settled-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#4CAF50"/>
              <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="dp-settled-title">정산이 완료되었습니다</h2>
          <p className="dp-settled-sub">
            {isRefunded ? '업체에서 무과실을 인정하였습니다.' : '분쟁이 정산 처리되었습니다.'}
          </p>

          <div className="dp-settled-card">
            <div className="dp-settled-row">
              <span className="dp-settled-label">최종 정산 금액</span>
              <span className="dp-settled-amount" style={{ color: isRefunded ? '#4CAF50' : '#E84040' }}>
                {isRefunded ? '0 CARE' : `${resolvedAmount?.toLocaleString() ?? '--'} CARE`}
              </span>
            </div>
            {dispute?.reason && (
              <div className="dp-settled-row">
                <span className="dp-settled-label">분쟁 사유</span>
                <span className="dp-settled-val">{dispute.reason}</span>
              </div>
            )}
          </div>

          <p className="dp-settled-notice">
            {isRefunded
              ? '보증금이 전액 환급됩니다.'
              : '정산 금액이 보증금에서 차감됩니다.'}
          </p>

          <div className="dp-settled-btns">
            <button className="dp-settled-btn-primary" onClick={() => navigate('/my-car')}>
              내 예약 보기
            </button>
            <button className="dp-settled-btn-secondary" onClick={() => navigate('/')}>
              홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dp-page">
      {/* 헤더 */}
      <header className="dp-header">
        <button className="dp-back" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img src={careLogo} alt="CARe" className="dp-logo" />
        <div style={{ width: 38 }} />
      </header>

      <div className="dp-scroll">
        {/* 분쟁 배너 - OPEN 상태에서만 표시 */}
        {(!dispute || dispute.status === 'OPEN') && (
        <button className="dp-dispute-banner" onClick={handleDispute}>
          <div className="dp-banner-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01" stroke="white" strokeWidth="2.2"
                strokeLinecap="round"/>
              <path d="M12 2L2 20h20L12 2z" stroke="white" strokeWidth="2"
                strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="dp-banner-text">
            <p className="dp-banner-title">{t('dispute.bannerTitle')}</p>
            <p className="dp-banner-sub">{t('dispute.bannerSub')}</p>
          </div>
        </button>
        )}

        {/* 로딩 / 에러 */}
        {loading && (
          <div className="dp-desc-box">
            <p className="dp-desc-text">{t('dispute.loading')}</p>
          </div>
        )}
        {error && (
          <div className="dp-desc-box">
            <p className="dp-desc-text" style={{ color: '#FF4D4F' }}>{error}</p>
          </div>
        )}

        {/* 분쟁 상세 정보 (API 데이터) */}
        {dispute && !loading && (
          <div className="dp-section">
            <p className="dp-section-title">{t('dispute.sectionTitle')}</p>
            <div className="dp-info-list">
              <div className="dp-info-row">
                <span className="dp-info-label">{t('dispute.status')}</span>
                <span className="dp-info-value">{t(`dispute.status${dispute.status.charAt(0)+dispute.status.slice(1).toLowerCase()}`) || dispute.status}</span>
              </div>
              {dispute.reason && (
                <div className="dp-info-row">
                  <span className="dp-info-label">{t('dispute.reason')}</span>
                  <span className="dp-info-value">{dispute.reason}</span>
                </div>
              )}
              {dispute.claimAmount != null && (
                <div className="dp-info-row">
                  <span className="dp-info-label">{t('dispute.claimAmount')}</span>
                  <span className="dp-info-value">{dispute.claimAmount.toLocaleString('ko-KR')} CARE</span>
                </div>
              )}
              {dispute.companySettlementAgreed && dispute.settlementFinalAmount != null && (
                <div className="dp-info-row">
                  <span className="dp-info-label">업체 제안 금액</span>
                  <span className="dp-info-value" style={{ color: '#1a7a45', fontWeight: 800 }}>
                    {dispute.settlementStatus === 'REFUNDED'
                      ? '무과실 인정 (0 CARE)'
                      : `${dispute.settlementFinalAmount.toLocaleString('ko-KR')} CARE`}
                  </span>
                </div>
              )}
              {dispute.createdAt && (
                <div className="dp-info-row">
                  <span className="dp-info-label">{t('dispute.appliedAt')}</span>
                  <span className="dp-info-value">{formatDateTime(dispute.createdAt)}</span>
                </div>
              )}
              {dispute.updatedAt && (
                <div className="dp-info-row">
                  <span className="dp-info-label">{t('dispute.lastUpdated')}</span>
                  <span className="dp-info-value">{formatDateTime(dispute.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI 유사도 판별 결과 */}
        <div className="dp-section">
          {dispute?.snapshotBeforeCropS3Url ? (
            /* ── 기존 흠집과 비교 가능한 경우 ── */
            <>
              <p className="dp-section-title">AI 유사도 비교</p>
              <div className="dp-compare-row">
                {/* 픽업 전 */}
                <div className="dp-compare-card">
                  <div className="dp-compare-img before">
                    <img src={dispute.snapshotBeforeCropS3Url} alt="픽업 전" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                  <p className="dp-compare-label">픽업 전</p>
                  {dispute?.snapshotCapturedAt && (
                    <p className="dp-compare-date">{formatDateTime(dispute.snapshotCapturedAt)}</p>
                  )}
                  <span className="dp-compare-tag normal">픽업 전 상태</span>
                </div>

                {/* 반납 후 */}
                <div className="dp-compare-card">
                  <div className="dp-compare-img after">
                    {dispute?.snapshotAfterCropS3Url
                      ? <img src={dispute.snapshotAfterCropS3Url} alt="반납 후" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                      : <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="5" width="18" height="14" rx="2" stroke="#ccc" strokeWidth="1.5"/>
                          <circle cx="12" cy="12" r="3" stroke="#ccc" strokeWidth="1.5"/>
                          <circle cx="17.5" cy="7.5" r="1" fill="#ccc"/>
                          <path d="M5 9l3 3M7 7l4 4" stroke="#FF4D4F" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    }
                  </div>
                  <p className="dp-compare-label">반납 후</p>
                  {dispute?.createdAt && (
                    <p className="dp-compare-date">{formatDateTime(dispute.createdAt)}</p>
                  )}
                  <span className={`dp-compare-tag${dispute?.snapshotWarning ? ' attention' : ' normal'}`}>
                    {dispute?.snapshotWarning ? '주의 필요' : '유사도 정상'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* ── 픽업 전 스캔에 없던 새 흠집 ── */
            <>
              <p className="dp-section-title">새 흠집 감지</p>
              <div className="dp-new-scratch-card">
                <div className="dp-new-scratch-badge">🆕 새로운 손상</div>
                <p className="dp-new-scratch-desc">
                  픽업 전 스캔에서 이 부위에 흠집이 없었습니다.<br/>
                  반납 후 새로운 손상이 감지되었습니다.
                </p>
                {dispute?.snapshotAfterCropS3Url && (
                  <div className="dp-new-scratch-img-wrap">
                    <p className="dp-new-scratch-img-label">반납 후 촬영</p>
                    <div className="dp-compare-img after" style={{ width: '100%', maxWidth: 240, margin: '0 auto' }}>
                      <img src={dispute.snapshotAfterCropS3Url} alt="반납 후" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 부위 표시 + 이력 버튼 */}
          {scratchZone && (
            <div className="dp-zone-row">
              <span className="dp-zone-label">
                📍 부위: {LOCATION_LABELS[scratchZone] || scratchZone}
              </span>
              <button
                className="dp-zone-btn"
                onClick={() => navigate('/damage-history', { state: { reservation, filterZone: scratchZone } })}
              >
                해당 부위 이력 보기 →
              </button>
            </div>
          )}
        </div>

        {/* 설명 텍스트 */}
        {dispute && (
          <div className="dp-desc-box">
            <p className="dp-desc-text">
              이전에 발생했던 흠집과 달리<br/>
              유사도가 <strong>{dispute.snapshotSimilarity != null ? Number(dispute.snapshotSimilarity).toFixed(2) : '--'}%</strong>로 확인되는<br/>
              다른 흠집들이 발견됐어요.
              {dispute.status === 'OPEN' && (
                <>
                  <br/>관련 사항에 대해 소명을 하고 싶으신 경우<br/>
                  이의 신청 버튼을 해주세요.
                </>
              )}
            </p>
          </div>
        )}

        <div style={{ height: 160 }} />
      </div>

      {/* 하단 버튼 - OPEN 상태에서만 표시 */}
      {(!dispute || dispute.status === 'OPEN') && (
        <div className="dp-footer">
          <button className="dp-dispute-btn" onClick={handleDispute}>
            이의 신청하기
          </button>
          <button className="dp-settle-btn" onClick={handleSettle} disabled={settling}>
            {dispute?.settlementFinalAmount != null ? '정산 동의' : '이의 없음'}
          </button>
        </div>
      )}
      {dispute && dispute.status !== 'OPEN' && (
        <div className="dp-footer dp-footer-resolved">
          <p className="dp-resolved-text">
            {['RESOLVED', 'COMPLETED'].includes(dispute.status) ? '완료된 분쟁입니다.' : '이의 신청이 접수되어 검토 중입니다.'}
          </p>
        </div>
      )}
    </div>
  )
}
