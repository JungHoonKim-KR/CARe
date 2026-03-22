// ─────────────────────────────────────────────────────────────
//  ScanPage.jsx  —  차량 흠집 스캔 메인 페이지
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation }       from 'react-router-dom'
import { Scanner }                      from './scanner.js'
import { drawBoxes, clearOverlay, updateARBoxes, startARLoop, stopARLoop } from './overlay.js'
import { ZONES }                        from './zones.js'
import styles                           from './ScanPage.module.css'
import { getScanResult }                from '../../api/scan'
import careLogo                         from '../../assets/care_logo.png'

export default function ScanPage() {
  const { reservationId } = useParams()
  const location          = useLocation()
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

  const currentZone = ZONES[zoneIndex]
  const history     = allScratches.filter(s => s.carPart === currentZone?.id)

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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const AI_WS_URL = import.meta.env.VITE_AI_WS_URL || `${protocol}//${window.location.hostname}:8000`
    const wsUrl = `${AI_WS_URL}/api/v1/scratches/ws/detect`
    wsRef.current = new WebSocket(wsUrl)
    wsRef.current.onopen = () => console.log('🟢 [WS] 연결 성공!')
    wsRef.current.onmessage = (event) => {
      if (matchStatusRef.current === 'captured') return
      const data = JSON.parse(event.data)
      if (data.boxes) updateARBoxes(data.boxes)
    }
    const interval = setInterval(() => {
      if (matchStatusRef.current === 'captured') return
      const video = videoRef.current, ws = wsRef.current
      if (!video || !ws || ws.readyState !== WebSocket.OPEN) return
      const c = document.createElement('canvas')
      c.width = 640; c.height = 360
      c.getContext('2d').drawImage(video, 0, 0, 640, 360)
      c.toBlob(blob => {
        if (blob && ws.readyState === WebSocket.OPEN) ws.send(blob)
      }, 'image/jpeg', 0.3)
    }, 400)
    return () => { clearInterval(interval); stopARLoop(); if (wsRef.current) wsRef.current.close() }
  }, [])

  // 카메라
  useEffect(() => {
    let stream = null, cancelled = false
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 1280, height: 720 },
      audio: false,
    })
      .then(s => {
        stream = s
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return }
        const video = videoRef.current
        if (!video) return
        video.srcObject = s
        video.onloadedmetadata = () => {
          if (!cancelled) {
            video.play().catch(() => {})
            startARLoop(arCanvasRef.current, video)
          }
        }
      })
      .catch(err => { if (!cancelled) console.error('[ScanPage] 카메라 실패', err) })
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
      stopARLoop()
      clearOverlay(arCanvasRef.current)
      if (canvasRef.current && videoRef.current)
        drawBoxes(canvasRef.current, videoRef.current, boxes)
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
  function handleCardClick(i) { setActiveCard(prev => prev === i ? null : i) }

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
      return `<strong style="color:#b8962e">촬영 버튼</strong>을 눌러 흠집을 저장하세요.`
    return currentZone.instruction
  }

  // 완료 화면
  if (isDone) return (
    <div className={styles.page}>
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
        <div className={styles.summaryGrid}>
          {ZONES.map(z => {
            const cap = captures[z.id]
            const hasDefect = (cap?.boxes?.length || 0) > 0
            return (
              <div key={z.id} className={`${styles.summaryCard} ${hasDefect ? styles.summaryCardHasDefect : ''}`}>
                <div className={styles.summaryCardImg} />
                <div className={styles.summaryCardInfo}>
                  <span className={styles.summaryCardZone}>{z.label}</span>
                  <span className={`${styles.summaryCardStatus} ${hasDefect ? styles.summaryCardDefect : styles.summaryCardClean}`}>
                    {hasDefect ? `흠집 ${cap.boxes.length}개` : '이상 없음'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <button className={styles.btnDone} onClick={() => console.log('완료:', captures)}>완료</button>
      </div>
    </div>
  )

  // 스캔 화면
  return (
    <div className={styles.page}>

      {/* 카메라 + 오버레이 */}
      <div className={styles.cameraWrap}>
        <video ref={videoRef} className={styles.video} playsInline muted />
        <canvas ref={arCanvasRef} className={styles.overlay} style={{ zIndex: 1 }} />
        <canvas ref={canvasRef}   className={styles.overlay} style={{ zIndex: 2 }} />
        <div className={styles.scanLine} />

        {/* 헤더 — 로고 + 구역 진행 */}
        <div className={styles.header}>
          <img src={careLogo} alt="CAre" className={styles.headerLogo} />
          <span className={styles.headerStep}>{zoneIndex + 1} / {ZONES.length}</span>
        </div>

        {/* 저장됨 토스트 */}
        <div className={`${styles.saveToast} ${showToast ? styles.visible : ''}`}>
          ✓ 흠집이 저장되었습니다
        </div>

        {/* 번호판 가이드 */}
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

        {/* 바퀴 가이드 */}
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

        {/* 스텝바 */}
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

      {/* 매칭 진행바 */}
      <div className={styles.matchProgress}>
        <div className={styles.matchFill} style={{ width: `${matchValue}%` }} />
      </div>

      {/* 안내 텍스트 */}
      <div className={styles.instruction}>
        <div className={styles.instructionIcon}>{currentZone.icon}</div>
        <div className={styles.instructionText} dangerouslySetInnerHTML={{ __html: getInstructionHtml() }} />
      </div>

      {/* 버튼 */}
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

      {/* 흠집 기록 — flex-grow로 남은 공간 채움 */}
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