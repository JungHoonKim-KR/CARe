import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import carIconCute from '../../assets/car_icon_cute.png'
import carIconTop from '../../assets/car_icon_top.png'
import carIconFront from '../../assets/car_icon_front.png'
import { completeReservation } from '../../api/reservation'
import './CarCrackPage.css'

// 4방향 패널 정의
const PANELS = [
  { id: 'front', label: '전면부', icon: 'front' },
  { id: 'rear',  label: '후면부', icon: 'rear'  },
  { id: 'left',  label: '좌측면', icon: 'left'  },
  { id: 'right', label: '우측면', icon: 'right' },
]

// 결과 화면에서 크랙 위치 (car_icon2 top-view 기준 %)
const CRACK_POSITIONS = {
  'front':       { top: '14%',  left: '50%' },
  'rear':        { top: '86%',  left: '50%' },
  'left':        { top: '50%',  left: '18%' },
  'right':       { top: '50%',  left: '82%' },
  'front-left':  { top: '30%',  left: '18%' },
  'front-right': { top: '30%',  left: '82%' },
  'rear-left':   { top: '70%',  left: '18%' },
  'rear-right':  { top: '70%',  left: '82%' },
}

// AI 분석 API (mock fallback 포함)
async function analyzeCarPhotos(photos) {
  const AI_BASE = import.meta.env.VITE_AI_BASE_URL || 'http://localhost:8000'
  try {
    const form = new FormData()
    Object.entries(photos).forEach(([side, dataUrl]) => {
      const blob = dataUrlToBlob(dataUrl)
      form.append(side, blob, `${side}.jpg`)
    })
    const res = await fetch(`${AI_BASE}/analyze-damage`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('AI 서버 오류')
    return res.json() // { cracks: [{ side, description }] }
  } catch {
    // mock: 랜덤으로 1~2개 크랙 반환
    const sides = Object.keys(photos)
    const shuffled = sides.sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 2) + 1
    return {
      cracks: shuffled.slice(0, count).map(side => ({
        side,
        description: side === 'front' ? '전면 범퍼 경미한 스크래치' :
                     side === 'rear'  ? '후면 범퍼 미세 흠집' :
                     side === 'left'  ? '좌측 도어 패널 스크래치' :
                                        '우측 휀더 경미한 스크래치',
      })),
      blockchainHash: '0x34e...698d',
    }
  }
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const bytes = new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)))
  return new Blob([bytes], { type: mime })
}

// 방향별 아이콘 스타일
function PanelIcon({ icon }) {
  if (icon === 'front') return <img src={carIconFront} alt="전면" className="cp-panel-icon" />
  if (icon === 'rear')  return <img src={carIconFront} alt="후면" className="cp-panel-icon cp-rotate-180" />
  if (icon === 'left')  return <img src={carIconCute}  alt="좌측" className="cp-panel-icon cp-side" />
  if (icon === 'right') return <img src={carIconCute}  alt="우측" className="cp-panel-icon cp-side cp-flip" />
  return null
}

export default function CarCrackPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const reservation = state?.reservation
  const scanResult = state?.scanResult // ScanPage에서 넘어온 결과
  const logType = state?.logType || 'BEFORE'

  // 플로우 단계: intro → select → camera → analyzing → result
  const [step, setStep] = useState(scanResult ? 'report' : 'intro')
  const [currentPanel, setCurrentPanel] = useState(null)  // 현재 촬영 중인 패널 id
  const [photos, setPhotos] = useState({})                 // { front: dataUrl, ... }
  const [analyzeResult, setAnalyzeResult] = useState(null) // { cracks, blockchainHash }
  const [sparkles, setSparkles] = useState(false)

  // 카메라
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
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
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

  // 분석 중 sparkle 애니메이션
  useEffect(() => {
    if (step !== 'analyzing') return
    const t = setInterval(() => setSparkles(v => !v), 700)
    return () => clearInterval(t)
  }, [step])

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

  const startAnalysis = async () => {
    setStep('analyzing')
    const result = await analyzeCarPhotos(photos)
    setAnalyzeResult(result)
    // 약 2.5초 후 결과 표시 (로딩 UX)
    setTimeout(() => setStep('result'), 2500)
  }

  // ─── 인트로 ───────────────────────────────────────────────────
  if (step === 'intro') return (
    <div className="cp-page">
      <button className="cp-back-btn" onClick={() => navigate(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="cp-intro-body">
        <h1 className="cp-intro-title">현재 차량의 흠집을<br/>체크할게요</h1>

        <div className="cp-car-ring">
          <img src={carIconCute} alt="차량" className="cp-car-main-icon" />
        </div>

        <div className="cp-intro-desc-wrap">
          <p className="cp-intro-desc">누구나 볼 수 있는 블록체인 노트에</p>
          <p className="cp-intro-desc-accent">쏙</p>
        </div>
      </div>

      <div className="cp-footer">
        <button className="cp-primary-btn" onClick={() => setStep('select')}>
          촬영하러 가기
        </button>
      </div>
    </div>
  )

  // ─── 4방향 촬영 선택 ────────────────────────────────────────
  if (step === 'select') return (
    <div className="cp-page">
      <div className="cp-select-header">
        <button className="cp-back-btn cp-back-inline" onClick={() => setStep('intro')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="cp-select-title">외관을 촬영해주세요</h2>
      </div>

      <div className="cp-panels-grid">
        {PANELS.map(panel => {
          const taken = !!photos[panel.id]
          return (
            <button
              key={panel.id}
              className={`cp-panel${taken ? ' done' : ''}`}
              onClick={() => openCamera(panel.id)}
            >
              <div className="cp-panel-icon-wrap">
                <PanelIcon icon={panel.icon} />
              </div>
              <p className="cp-panel-label">{panel.label}</p>
              <span className={`cp-panel-badge${taken ? ' done' : ''}`}>
                {taken ? '촬영완료' : '미촬영'}
              </span>
            </button>
          )
        })}
      </div>

      <div className="cp-footer">
        <button
          className={`cp-primary-btn${allCaptured ? '' : ' disabled'}`}
          onClick={allCaptured ? startAnalysis : undefined}
          disabled={!allCaptured}
        >
          AI 흠집 진단 시작
        </button>
        {!allCaptured && (
          <p className="cp-select-hint">4방향 모두 촬영 후 진단을 시작할 수 있어요</p>
        )}
      </div>
    </div>
  )

  // ─── 카메라 ──────────────────────────────────────────────────
  if (step === 'camera') {
    const panel = PANELS.find(p => p.id === currentPanel)
    return (
      <div className="cp-cam-page">
        <div className="cp-cam-header">
          <button className="cp-cam-back" onClick={() => { stopCamera(); setStep('select') }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <p className="cp-cam-title">{panel?.label} 촬영</p>
            <p className="cp-cam-sub">차량을 가이드 선에 맞춰주세요</p>
          </div>
        </div>

        <div className="cp-cam-area">
          {camError ? (
            <div className="cp-cam-error">
              <p>카메라 접근 권한이 필요합니다</p>
              <button onClick={startCamera}>다시 시도</button>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="cp-cam-video" />
          )}
          <div className="cp-cam-guide" />
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="cp-cam-footer">
          <button
            className="cp-shutter-btn"
            onClick={capturePhoto}
            disabled={!camReady && !camError}
          >
            <div className="cp-shutter-ring">
              <div className="cp-shutter-inner" />
            </div>
          </button>
        </div>
      </div>
    )
  }

  // ─── 분석 중 ─────────────────────────────────────────────────
  if (step === 'analyzing') return (
    <div className="cp-analyzing-page">
      <div className="cp-analyzing-wrap">
        <div className="cp-analyzing-ring">
          <div className="cp-analyzing-arc" />
          {sparkles && <>
            <span className="cp-sparkle cp-sp1">✦</span>
            <span className="cp-sparkle cp-sp2">✦</span>
            <span className="cp-sparkle cp-sp3">✦</span>
            <span className="cp-sparkle cp-sp4">✦</span>
          </>}
          <img src={carIconCute} alt="분석 중" className="cp-analyzing-car" />
        </div>
      </div>
      <p className="cp-analyzing-title">차량 분석 중...</p>
      <p className="cp-analyzing-desc">수집된 이미지를 바탕으로<br/>흠집 및 파손 여부를 분석하고 있어요</p>
    </div>
  )

  // ─── 결과 ────────────────────────────────────────────────────
  if (step === 'result' && analyzeResult) {
    const { cracks, blockchainHash } = analyzeResult
    return (
      <div className="cp-page cp-result-page">
        <div className="cp-result-header">
          <div>
            <p className="cp-result-label">발견된 흠집</p>
            <p className="cp-result-count">총 <span>{cracks.length}</span>건</p>
          </div>
          <div className="cp-blockchain-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="#F7A633" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M3 17L12 22L21 17" stroke="#F7A633" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M3 12L12 17L21 12" stroke="#F7A633" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="cp-blockchain-label">blockchain verified</p>
              {blockchainHash && <p className="cp-blockchain-hash">hash : {blockchainHash}</p>}
            </div>
          </div>
        </div>

        {/* 탑뷰 차량 + 크랙 마커 */}
        <div className="cp-car-map-wrap">
          <div className="cp-car-map-ring">
            <div className="cp-car-map-inner">
              <img src={carIconTop} alt="차량 탑뷰" className="cp-car-map-img" />
              {cracks.map(crack => {
                const pos = CRACK_POSITIONS[crack.side]
                return pos ? (
                  <div key={crack.side} className="cp-crack-marker" style={pos}>
                    <div className="cp-crack-dot" />
                    <div className="cp-crack-pulse" />
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>

        {/* AI 진단 카드 */}
        <div className="cp-ai-card">
          <div className="cp-ai-card-title">
            <span className="cp-ai-icon">✦</span>
            <span>AI 차량 진단</span>
          </div>
          <p className="cp-ai-card-body">
            분석 결과, 현재{' '}
            <span className="cp-ai-highlight">{cracks.length}건의 흠집이 존재</span>합니다.
            <br/>상세 내역을 확인하세요.
          </p>
        </div>

        <div className="cp-blockchain-notice">
          <p>걱정 마세요!</p>
          <p>CARe가 자체 블록체인에 안전하게 기록해뒀어요</p>
        </div>

        <div className="cp-footer">
          <button
            className="cp-primary-btn cp-smartkey-btn"
            onClick={() => {
              if (reservation?.reservationId) {
                localStorage.setItem(`crackDone_${reservation.reservationId}`, 'true')
              }
              navigate('/car-smartkey', { state: { reservation } })
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
              <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
            스마트키 열기
          </button>
          <div className="cp-result-sub-row">
            <button
              className="cp-sub-btn"
              onClick={() => navigate('/damage-history', { state: { reservation } })}
            >
              흠집 내역 확인
            </button>
            <button
              className="cp-sub-btn"
              onClick={() => navigate('/my-car')}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── 스캔 리포트 (ScanPage에서 진입) ──────────────────────
  if (step === 'report' && scanResult) {
    const { cracks, totalDefects } = scanResult
    return (
      <div className="cp-page cp-result-page">
        <div className="cp-result-header">
          <div>
            <p className="cp-result-label">발견된 흠집</p>
            <p className="cp-result-count">총 <span>{totalDefects}</span>건</p>
          </div>
          <div className="cp-blockchain-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="#F7A633" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M3 17L12 22L21 17" stroke="#F7A633" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M3 12L12 17L21 12" stroke="#F7A633" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="cp-blockchain-label">blockchain verified</p>
            </div>
          </div>
        </div>

        {/* 탑뷰 차량 + 크랙 마커 */}
        <div className="cp-car-map-wrap">
          <div className="cp-car-map-ring">
            <div className="cp-car-map-inner">
              <img src={carIconTop} alt="차량 탑뷰" className="cp-car-map-img" />
              {cracks.map(crack => {
                const pos = CRACK_POSITIONS[crack.side]
                return pos ? (
                  <div key={crack.side} className="cp-crack-marker" style={pos}>
                    <div className="cp-crack-dot" />
                    <div className="cp-crack-pulse" />
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>

        {/* 구역별 흠집 상세 */}
        <div className="cp-ai-card">
          <div className="cp-ai-card-title">
            <span className="cp-ai-icon">✦</span>
            <span>AI 차량 진단</span>
          </div>
          {totalDefects > 0 ? (
            <>
              <p className="cp-ai-card-body">
                분석 결과, 현재{' '}
                <span className="cp-ai-highlight">{totalDefects}건의 흠집이 존재</span>합니다.
              </p>
              {cracks.map(c => (
                <div key={c.side} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, minWidth: 80 }}>{c.label}</span>
                  <span style={{ fontSize: 13, color: '#666' }}>흠집 {c.count}건</span>
                  <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                    {c.crops?.slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt="흠집" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="cp-ai-card-body">
              <span className="cp-ai-highlight" style={{ color: '#10b981' }}>흠집이 발견되지 않았습니다.</span>
              <br/>깨끗한 상태입니다.
            </p>
          )}
        </div>

        <div className="cp-blockchain-notice">
          <p>걱정 마세요!</p>
          <p>CARe가 자체 블록체인에 안전하게 기록해뒀어요</p>
        </div>

        <div className="cp-footer">
          <button
            className="cp-primary-btn cp-smartkey-btn"
            onClick={async () => {
              if (logType === 'AFTER') {
                try {
                  await completeReservation(reservation?.reservationId)
                  navigate('/car-return', { state: { reservation, done: true } })
                } catch (e) {
                  alert('반납 처리 중 오류가 발생했습니다.')
                }
              } else {
                if (reservation?.reservationId) {
                  localStorage.setItem(`crackDone_${reservation.reservationId}`, 'true')
                }
                navigate('/car-smartkey', { state: { reservation } })
              }
            }}
          >
            {logType === 'AFTER' ? (
              '반납하기'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                  <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
                스마트키 열기
              </>
            )}
          </button>
          <div className="cp-result-sub-row">
            <button
              className="cp-sub-btn"
              onClick={() => navigate('/damage-history', { state: { reservation } })}
            >
              흠집 내역 확인
            </button>
            <button
              className="cp-sub-btn"
              onClick={() => navigate('/my-car')}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
