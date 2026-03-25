import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import carIconCute from '../../assets/car_icon_cute.png'
import carIconFront from '../../assets/car_icon_front.png'
import { scanAfter, completeReservation, lockSmartKey } from '../../api/reservation'
import './CarReturnPage.css'

const PANELS = [
  { id: 'front', label: '전면부', icon: 'front' },
  { id: 'rear',  label: '후면부', icon: 'rear'  },
  { id: 'left',  label: '좌측면', icon: 'left'  },
  { id: 'right', label: '우측면', icon: 'right' },
]

function PanelIcon({ icon }) {
  if (icon === 'front') return <img src={carIconFront} alt="전면" className="cr-panel-icon" />
  if (icon === 'rear')  return <img src={carIconFront} alt="후면" className="cr-panel-icon cr-rotate-180" />
  if (icon === 'left')  return <img src={carIconCute}  alt="좌측" className="cr-panel-icon cr-side" />
  if (icon === 'right') return <img src={carIconCute}  alt="우측" className="cr-panel-icon cr-side cr-flip" />
  return null
}

export default function CarReturnPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const reservation = state?.reservation
  const fromScan = state?.fromScan || false
  const returnDone = state?.returnDone || false

  // intro → select → camera → submitting → done
  // returnDone=true: 이미 반납 API 완료됨 → 바로 done 화면
  // fromScan=true: 스캔 후 반납 확인 → confirm 단계
  const [step, setStep] = useState(returnDone ? 'done' : fromScan ? 'confirm' : 'intro')
  const [currentPanel, setCurrentPanel] = useState(null)
  const [photos, setPhotos] = useState({})

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [camReady, setCamReady] = useState(false)
  const [camError, setCamError] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    setCamReady(false)
    setCamError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCamReady(true)
      }
    } catch {
      setCamError(true)
    }
  }, [])

  useEffect(() => {
    if (step === 'camera') startCamera()
    else stopCamera()
    return stopCamera
  }, [step, startCamera, stopCamera])

  const allCaptured = PANELS.every(p => photos[p.id])

  const openCamera = (panelId) => {
    setCurrentPanel(panelId)
    setStep('camera')
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    stopCamera()
    setPhotos(prev => ({ ...prev, [currentPanel]: dataUrl }))
    setCurrentPanel(null)
    setStep('select')
  }

  const submitReturn = () => {
    const rid = reservation?.reservationId
    if (rid) {
      localStorage.setItem(`disputePending_${rid}`, 'true')
      localStorage.setItem(`disputeDate_${rid}`, reservation.endDate || '')
    }
    setStep('done')
    if (rid) {
      // 스마트키 반납 + 반납 완료 상태 변경 + 사진 업로드 백그라운드 처리
      lockSmartKey(rid).catch(e => console.error('[Return] 스마트키 반납 실패:', e))
      completeReservation(rid).catch(e => console.error('[Return] 반납 완료 API 실패:', e))
      if (!fromScan) {
        Promise.all(PANELS.map(p => scanAfter(rid, p.id, photos[p.id])))
          .catch(e => console.error('[Return] 스캔 업로드 실패:', e))
      }
    }
  }

  // ─── 스캔 완료 후 반납 확인 (fromScan) ──────────────────────
  if (step === 'confirm') return (
    <div className="cr-page">
      <div className="cr-intro-body">
        <div className="cr-icon-ring">
          <img src={carIconCute} alt="차량" className="cr-car-icon" />
        </div>
        <div className="cr-intro-text">
          <h1 className="cr-intro-title">반납을 완료하시겠습니까?</h1>
          <p className="cr-intro-desc">
            확인 시 스마트키가 반납되고<br/>
            차량 상태가 반납완료로 변경돼요
          </p>
        </div>
      </div>
      <div className="cr-footer">
        <button className="cr-primary-btn" onClick={submitReturn}>
          반납 완료하기
        </button>
      </div>
    </div>
  )

  // ─── 인트로 ───────────────────────────────────────────────────
  if (step === 'intro') return (
    <div className="cr-page">
      <button className="cr-back" onClick={() => navigate(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#222" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="cr-intro-body">
        <div className="cr-icon-ring">
          <img src={carIconCute} alt="차량" className="cr-car-icon" />
        </div>
        <div className="cr-intro-text">
          <h1 className="cr-intro-title">반납 전 차량 외관을<br/>촬영해주세요</h1>
          <p className="cr-intro-desc">
            촬영 사진은 블록체인에 저장되며<br/>
            업체에게 반납 알림이 전송돼요
          </p>
        </div>
        <div className="cr-intro-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
              stroke="#F7A633" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#F7A633" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>4방향 모두 촬영해야 반납할 수 있어요</span>
        </div>
      </div>

      <div className="cr-footer">
        <button className="cr-primary-btn" onClick={() => setStep('select')}>
          촬영하러 가기
        </button>
      </div>
    </div>
  )

  // ─── 4방향 촬영 선택 ────────────────────────────────────────
  if (step === 'select') return (
    <div className="cr-page">
      <div className="cr-select-header">
        <button className="cr-back-inline" onClick={() => setStep('intro')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#222" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="cr-select-title">반납 외관 촬영</h2>
      </div>

      <div className="cr-progress-row">
        {PANELS.map(p => (
          <div key={p.id} className={`cr-progress-dot${photos[p.id] ? ' done' : ''}`} />
        ))}
        <span className="cr-progress-text">
          {Object.keys(photos).length} / {PANELS.length}
        </span>
      </div>

      <div className="cr-panels-grid">
        {PANELS.map(panel => {
          const taken = !!photos[panel.id]
          return (
            <button
              key={panel.id}
              className={`cr-panel${taken ? ' done' : ''}`}
              onClick={() => openCamera(panel.id)}
            >
              <div className="cr-panel-icon-wrap">
                <PanelIcon icon={panel.icon} />
                {taken && (
                  <div className="cr-panel-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="cr-panel-label">{panel.label}</p>
              <span className={`cr-panel-badge${taken ? ' done' : ''}`}>
                {taken ? '촬영완료' : '미촬영'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="cr-footer">
        <button
          className={`cr-primary-btn${allCaptured ? '' : ' disabled'}`}
          onClick={allCaptured ? submitReturn : undefined}
          disabled={!allCaptured}
        >
          반납 완료하기
        </button>
        {!allCaptured && (
          <p className="cr-hint">4방향 모두 촬영 후 반납할 수 있어요</p>
        )}
      </div>
    </div>
  )

  // ─── 카메라 ──────────────────────────────────────────────────
  if (step === 'camera') {
    const panel = PANELS.find(p => p.id === currentPanel)
    return (
      <div className="cr-cam-page">
        <div className="cr-cam-header">
          <button className="cr-cam-back" onClick={() => { stopCamera(); setStep('select') }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <p className="cr-cam-title">{panel?.label} 촬영</p>
            <p className="cr-cam-sub">차량을 가이드 선에 맞춰주세요</p>
          </div>
        </div>

        <div className="cr-cam-area">
          {camError ? (
            <div className="cr-cam-error">
              <p>카메라 접근 권한이 필요합니다</p>
              <button onClick={startCamera}>다시 시도</button>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="cr-cam-video" />
          )}
          <div className="cr-cam-guide" />
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="cr-cam-footer">
          <button
            className="cr-shutter-btn"
            onClick={capturePhoto}
            disabled={!camReady && !camError}
          >
            <div className="cr-shutter-ring">
              <div className="cr-shutter-inner" />
            </div>
          </button>
        </div>
      </div>
    )
  }

  // ─── 전송 중 ─────────────────────────────────────────────────
  if (step === 'submitting') return (
    <div className="cr-loading-page">
      <div className="cr-loading-spinner" />
      <p className="cr-loading-title">반납 처리 중...</p>
      <p className="cr-loading-desc">촬영 사진을 저장하고<br/>임대인에게 반납 알림을 전송하고 있어요</p>
    </div>
  )

  // ─── 완료 ────────────────────────────────────────────────────
  if (step === 'done') return (
    <div className="cr-done-page">
      <div className="cr-done-icon cr-done-icon--animate">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="cr-done-text-group">
        <h1 className="cr-done-title">반납이 완료되었습니다</h1>
        <p className="cr-done-desc">
          사진이 블록체인에 안전하게 저장됐어요.<br/>
          이용해 주셔서 감사합니다.
        </p>
      </div>
      <button className="cr-done-btn" onClick={() => navigate('/landing')}>
        홈으로 돌아가기
      </button>
    </div>
  )

  return null
}
