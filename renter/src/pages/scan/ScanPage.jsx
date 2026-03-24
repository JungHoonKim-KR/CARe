// ─────────────────────────────────────────────────────────────
//  ScanPage.jsx  —  차량 흠집 스캔 메인 페이지
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Scanner }                      from './scanner.js'
import { ZONES }                        from './zones.js'
import styles                           from './ScanPage.module.css'
import { getScanResult }                from '../../api/scan'
import careLogo                         from '../../assets/care_logo.png'
import { clearOverlay, updateARBoxes, startARLoop, stopARLoop, showHistoryOverlay } from './overlay.js'

export default function ScanPage() {
  const { reservationId } = useParams()
  const location          = useLocation()
  const navigate          = useNavigate()
  const logType           = location.state?.logType || 'BEFORE'

  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const scannerRef  = useRef(null)
  const wheelLRef   = useRef(null)
  const wheelRRef   = useRef(null)
  const arCanvasRef = useRef(null)
  const wsRef       = useRef(null)

  const [zoneIndex,    setZoneIndex]    = useState(0)
  const [captures,     setCaptures]     = useState({})
  const [isDone,       setIsDone]       = useState(false)
  const [matchStatus,  setMatchStatus]  = useState('detecting')
  const [matchValue,   setMatchValue]   = useState(0)
  const [showToast,    setShowToast]    = useState(false)
  const [canCapture,   setCanCapture]   = useState(false)
  const [isCapturing,  setIsCapturing]  = useState(false)
  const [allScratches, setAllScratches] = useState([])
  const [activeCard,   setActiveCard]   = useState(null)
  const [debugLog,     setDebugLog]     = useState('')  // ✅ 모바일 디버그용

  const currentZone = ZONES[zoneIndex]
  const history     = allScratches.filter(s => s.carPart === currentZone?.id)

  const isWaitingRef   = useRef(false)
  const timeoutRef     = useRef(null)
  const matchStatusRef = useRef(matchStatus)
  useEffect(() => { matchStatusRef.current = matchStatus }, [matchStatus])
  useEffect(() => { setActiveCard(null) }, [zoneIndex])

  // 마운트 시 전체 흠집 조회
  useEffect(() => {
    if (!reservationId) return
    getScanResult(reservationId, 'BEFORE')
      .then(data => setAllScratches(Array.isArray(data) ? data : []))
      .catch(() => setAllScratches([]))
  }, [])

  // 폰트 로드
  useEffect(() => {
    const link = document.createElement('link')
    link.href  = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pretendard:wght@300;400;500;600;700&display=swap'
    link.rel   = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // WebSocket + rAF
  useEffect(() => {
    const protocol  = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const AI_WS_URL = import.meta.env.VITE_AI_WS_URL || `${protocol}//${window.location.hostname}:8000`
    const wsUrl     = `${AI_WS_URL}/api/v1/scratches/ws/detect`
    wsRef.current   = new WebSocket(wsUrl)
    wsRef.current.onopen = () => {
      console.log('🟢 [WS] 연결 성공!')
      setDebugLog(prev => prev + ' | WS연결OK')
    }

    wsRef.current.onmessage = (event) => {
      isWaitingRef.current = false
      clearTimeout(timeoutRef.current)
      if (matchStatusRef.current === 'captured') return
      const data = JSON.parse(event.data)

      if (data.boxes) {
        const video = videoRef.current
        const vw = video?.videoWidth  || 640
        const vh = video?.videoHeight || 360
        const scale = 640 / Math.max(vw, vh)
        const capW  = Math.round(vw * scale)
        const capH  = Math.round(vh * scale)

        // ✅ 실제 캡처 해상도 기준으로 스케일 변환
        updateARBoxes(data.boxes, capW, capH)
      }
    }

    const interval = setInterval(() => {
      if (matchStatusRef.current === 'captured') return
      if (isWaitingRef.current) return

      const video = videoRef.current, ws = wsRef.current
      if (!video || !ws || ws.readyState !== WebSocket.OPEN) return

      // ✅ 비디오 실제 비율 유지
      const vw = video.videoWidth  || 640
      const vh = video.videoHeight || 360

      // 긴 쪽을 640 기준으로 스케일
      const scale  = 640 / Math.max(vw, vh)
      const capW   = Math.round(vw * scale)
      const capH   = Math.round(vh * scale)

      const c = document.createElement('canvas')
      c.width  = capW
      c.height = capH
      c.getContext('2d').drawImage(video, 0, 0, capW, capH)

      c.toBlob(blob => {
        if (blob && ws.readyState === WebSocket.OPEN) {
          isWaitingRef.current = true
          ws.send(blob)
          timeoutRef.current = setTimeout(() => {
            isWaitingRef.current = false
          }, 2000)
        }
      }, 'image/jpeg', 0.6)
    }, 200)
    return () => { clearInterval(interval); stopARLoop(); if (wsRef.current) wsRef.current.close() }
  }, [])

  // 카메라
  useEffect(() => {
    let stream = null, cancelled = false
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
      .then(s => {
        stream = s
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return }
        const video = videoRef.current
        if (!video) return
        video.srcObject = s

        // ✅ onloadedmetadata: play만 (모바일은 이 시점에 videoWidth=0일 수 있음)
        video.onloadedmetadata = () => {
          const msg = `meta:${video.videoWidth}x${video.videoHeight} ready:${video.readyState}`
          console.log('📱', msg)
          setDebugLog(prev => prev + ' | ' + msg)
          if (!cancelled) video.play().catch(() => {})
        }

        // ✅ onloadeddata: 실제 프레임 나온 후 AR 시작 — 모바일 핵심 수정
        video.onloadeddata = () => {
          const msg = `data:${video.videoWidth}x${video.videoHeight}`
          console.log('📱', msg)
          setDebugLog(prev => prev + ' | ' + msg)
          if (!cancelled) startARLoop(arCanvasRef.current, video)
        }
      })
      .catch(err => {
        console.error('[ScanPage] 카메라 실패', err)
        setDebugLog(prev => prev + ' | 카메라실패:' + err.message)
      })
    return () => { cancelled = true; stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  // Scanner
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setMatchStatus('detecting'); setMatchValue(0); setCanCapture(false); setIsCapturing(false)
    clearOverlay(canvasRef.current); clearOverlay(arCanvasRef.current)

    const scanner = new Scanner(video, reservationId, logType)
    scannerRef.current = scanner

    scanner.onMatching = (progress) => {
      setMatchValue(progress)
      const dash = (progress / 100) * 2 * Math.PI * 44
      ;[wheelLRef, wheelRRef].forEach(ref => {
        const c = ref.current?.querySelector('circle')
        if (c) c.style.strokeDasharray = `${dash} 999`
      })
    }
    scanner.onMatched = () => { setMatchStatus('matched'); setCanCapture(true) }
    scanner.onCapture = (zoneId, dataUrl, boxes) => {
      setCaptures(prev => ({ ...prev, [zoneId]: { dataUrl, boxes } }))
      setMatchStatus('captured'); setCanCapture(false); setIsCapturing(false)
      // scanner.onCapture 안에 추가
      if (boxes.length > 0 && navigator.vibrate) {
        navigator.vibrate(200)  // ✅ 흠집 발견 시 진동
      }
      stopARLoop()
      clearOverlay(arCanvasRef.current)
      if (canvasRef.current && videoRef.current)
      if (boxes.length > 0) { setShowToast(true); setTimeout(() => setShowToast(false), 2000) }
    }
    scanner.setZone(currentZone)
    scanner.startMatching()
    return () => { scannerRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneIndex])

  // 구역 넘어갈 때 rAF 재시작
  useEffect(() => {
    if (zoneIndex === 0) return
    const video = videoRef.current
    if (video && video.readyState >= 2) startARLoop(arCanvasRef.current, video)
  }, [zoneIndex])

  async function handleCapture() {
    if (!scannerRef.current || !canCapture || isCapturing) return
    setIsCapturing(true); setCanCapture(false)
    await scannerRef.current.capture()
  }
  function handleNext() {
    if (zoneIndex < ZONES.length - 1) setZoneIndex(zoneIndex + 1)
    else setIsDone(true)
  }
  function handleSkip() {
    setCaptures(prev => ({ ...prev, [currentZone.id]: { dataUrl: null, boxes: [] } }))
    handleNext()
  }
  function handleCardClick(i) {
    const newActive = activeCard === i ? null : i
    setActiveCard(newActive)
    if (newActive !== null)
      showHistoryOverlay(history[newActive], videoRef.current, arCanvasRef.current)
    else
      showHistoryOverlay(null, videoRef.current, arCanvasRef.current)
  }

  const totalDefects = Object.values(captures).reduce((a, c) => a + (c.boxes?.length || 0), 0)

  function getInstructionHtml() {
    if (matchStatus === 'captured') {
      const cap   = captures[currentZone?.id]
      const count = cap?.boxes?.length || 0
      return count > 0
        ? `<strong style="color:#ef4444">흠집 ${count}개</strong>가 감지되어 저장되었습니다.`
        : `<strong style="color:#10b981">이상 없음</strong> — 깨끗한 상태입니다.`
    }
    if (matchStatus === 'matched')
      return `<strong style="color:#F7A633">촬영 버튼</strong>을 눌러 흠집을 저장하세요.`
    return currentZone.instruction
  }

  // ── 완료 화면
  if (isDone) return (
    <div className={styles.page} style={{ overflowY: 'auto' }}>
      <div className={styles.summary}>
        <div className={styles.summaryHero}>
          <div className={styles.summaryCheck}>✓</div>
          <div className={styles.summaryHeroTitle}>스캔 완료</div>
          <div className={styles.summaryHeroSub}>모든 구역이 안전하게 기록되었습니다</div>
        </div>

        <div className={styles.summaryStats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>감지된 흠집</div>
            <div className={`${styles.statValue} ${styles.statValueDefect}`}>{totalDefects}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>스캔 구역</div>
            <div className={`${styles.statValue} ${styles.statValueSafe}`}>{ZONES.length}</div>
          </div>
        </div>

        {ZONES.map(z => {
          const cap       = captures[z.id]
          const boxes     = cap?.boxes || []
          const hasDefect = boxes.length > 0
          if (!hasDefect) return null
          return (
            <div key={z.id} className={styles.summaryZoneCard}>
              <div className={styles.summaryZoneHeader}>
                <span className={styles.summaryZoneName}>{z.label}</span>
                <span className={styles.summaryZoneCount}>흠집 {boxes.length}개</span>
              </div>
              <div className={styles.summaryZoneScroll}>
                {boxes.map((box, i) => (
                  box.cropS3Url
                    ? <img key={i} src={box.cropS3Url} alt={`흠집 ${i + 1}`} className={styles.summaryCropImg} />
                    : <div key={i} className={styles.summaryCropImgEmpty} />
                ))}
              </div>
            </div>
          )
        })}

        {totalDefects === 0 && (
          <div className={styles.summaryAllClear}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <p>모든 구역에서 흠집이 발견되지 않았어요!</p>
          </div>
        )}

        <button className={styles.btnDone} onClick={() => navigate('/my-car')}>
          완료
        </button>
      </div>
    </div>
  )

  // ── 스캔 화면
  return (
    <div className={styles.page}>

      {/* ✅ 모바일 디버그 오버레이 — 확인 후 제거 */}
      {debugLog ? (
        <div style={{
          position: 'fixed', top: 0, left: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', color: '#00ff88',
          fontSize: 10, padding: '6px 8px', wordBreak: 'break-all',
          maxWidth: '100vw', pointerEvents: 'none',
        }}>
          {debugLog}
        </div>
      ) : null}

      <div className={styles.cameraWrap}>
        <video ref={videoRef} className={styles.video} playsInline muted />
        <canvas ref={arCanvasRef} className={styles.overlay} style={{ zIndex: 1 }} />
        <canvas ref={canvasRef}   className={styles.overlay} style={{ zIndex: 2 }} />
        <div className={styles.scanLine} />

        <div className={styles.header}>
          <img src={careLogo} alt="CAre" className={styles.headerLogo} />
          <span className={styles.headerStep}>{zoneIndex + 1} / {ZONES.length}</span>
        </div>

        <div className={`${styles.saveToast} ${showToast ? styles.visible : ''}`}>
          ✓ 흠집이 저장되었습니다
        </div>

        {currentZone.type === 'plate' && matchStatus !== 'captured' && (
          <div className={`${styles.guidePlate} ${styles[matchStatus] || styles.detecting}`}>
            <div className={styles.guidePlateInner}>
              <div className={`${styles.plateCorner} ${styles.tl}`} />
              <div className={`${styles.plateCorner} ${styles.tr}`} />
              <div className={`${styles.plateCorner} ${styles.bl}`} />
              <div className={`${styles.plateCorner} ${styles.br}`} />
              <span className={styles.plateHint}>번호판</span>
            </div>
          </div>
        )}

        {currentZone.type === 'wheel' && matchStatus !== 'captured' && (
          <>
            {currentZone.wheelSide === 'left' && (
              <div className={`${styles.guideWheel} ${styles.left} ${styles[matchStatus] || styles.detecting}`}>
                <div className={styles.wheelCircle}><div className={styles.wheelHub} /></div>
                <div className={styles.wheelProgress} ref={wheelLRef}>
                  <svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="44" /></svg>
                </div>
              </div>
            )}
            {currentZone.wheelSide === 'right' && (
              <div className={`${styles.guideWheel} ${styles.right} ${styles[matchStatus] || styles.detecting}`}>
                <div className={styles.wheelCircle}><div className={styles.wheelHub} /></div>
                <div className={styles.wheelProgress} ref={wheelRRef}>
                  <svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="44" /></svg>
                </div>
              </div>
            )}
          </>
        )}

        <div className={styles.stepbar}>
          {ZONES.map((z, i) => {
            const cap = captures[z.id]
            let cls = ''
            if (i < zoneIndex && cap) cls = (cap.boxes?.length > 0) ? styles.defect : styles.done
            else if (i === zoneIndex) cls = styles.active
            return (
              <div key={z.id} className={`${styles.step} ${cls}`}>
                <div className={styles.stepTrack} />
              </div>
            )
          })}
        </div>

        <div className={styles.zoneNameBar}>
          <span className={styles.zoneName}>{currentZone.name}</span>
        </div>
      </div>

      <div className={styles.matchProgress}>
        <div className={styles.matchFill} style={{ width: `${matchValue}%` }} />
      </div>

      <div className={styles.instruction}>
        <div className={styles.instructionIcon}>{currentZone.icon}</div>
        <div className={styles.instructionText} dangerouslySetInnerHTML={{ __html: getInstructionHtml() }} />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={handleSkip}>건너뛰기</button>
        {matchStatus !== 'captured' ? (
          <button className={styles.btnCapture} onClick={handleCapture} disabled={!canCapture || isCapturing}>
            {isCapturing ? '분석 중...' : canCapture ? '📷 촬영' : '인식 중...'}
          </button>
        ) : (
          <button className={styles.btnNext} onClick={handleNext}>
            {zoneIndex < ZONES.length - 1 ? '다음 구역 →' : '스캔 완료 →'}
          </button>
        )}
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <span className={styles.historyTitle}>이 구역의 흠집 기록</span>
          {history.length > 0
            ? <span className={styles.historyCount}>{history.length}건</span>
            : <span className={styles.historyCountNone}>기록 없음</span>
          }
        </div>
        <div className={styles.historyScroll}>
          {history.length === 0
            ? <div className={styles.historyEmpty}>이 구역의 이전 흠집 기록이 없어요</div>
            : history.map((h, i) => (
                <div
                  key={i}
                  className={`${styles.historyCard} ${activeCard === i ? styles.active : ''}`}
                  onClick={() => handleCardClick(i)}
                >
                  <img src={h.cropS3Url} className={styles.historyCardImg} alt="흠집" />
                  <div className={styles.historyCardInfo}>
                    <div className={styles.historyCardDate}>
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </div>
                    <div className={styles.historyCardCount}>흠집 감지됨</div>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}