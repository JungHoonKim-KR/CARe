// ─────────────────────────────────────────────────────────────
//  ScanPage.jsx  —  차량 흠집 스캔 메인 페이지
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation }       from 'react-router-dom'
import { Scanner }                      from './scanner.js'
import { drawBoxes, clearOverlay }      from './overlay.js'
import { ZONES, MOCK_HISTORY, MOCK_RESULTS } from './zones.js'
import styles                           from './ScanPage.module.css'

export default function ScanPage() {
  const { reservationId } = useParams()
  const location          = useLocation()
  const logType           = location.state?.logType || 'BEFORE'

  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const scannerRef = useRef(null)
  const wheelLRef  = useRef(null)
  const wheelRRef  = useRef(null)

  const [zoneIndex,   setZoneIndex]   = useState(0)
  const [captures,    setCaptures]    = useState({})
  const [isDone,      setIsDone]      = useState(false)
  const [matchStatus, setMatchStatus] = useState('detecting')
  const [matchValue,  setMatchValue]  = useState(0)
  const [showToast,   setShowToast]   = useState(false)

  const currentZone = ZONES[zoneIndex]

  useEffect(() => {
    const link = document.createElement('link')
    link.href  = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pretendard:wght@300;400;500;600;700&display=swap'
    link.rel   = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    let stream    = null
    let cancelled = false

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 1280, height: 720 },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.onloadedmetadata = () => {
          if (!cancelled) video.play().catch(() => {})
        }
      } catch (err) {
        if (!cancelled) console.error('[ScanPage] 카메라 접근 실패', err)
      }
    }
    startCamera()
    return () => {
      cancelled = true
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setMatchStatus('detecting')
    setMatchValue(0)
    clearOverlay(canvasRef.current)

    const scanner = new Scanner(video, reservationId, logType)
    scannerRef.current = scanner

    scanner.onMatching = (progress) => {
      setMatchValue(progress)
      const circumference = 2 * Math.PI * 44
      const dash = (progress / 100) * circumference
      if (wheelLRef.current) {
        const circle = wheelLRef.current.querySelector('circle')
        if (circle) circle.style.strokeDasharray = `${dash} 999`
      }
      if (wheelRRef.current) {
        const circle = wheelRRef.current.querySelector('circle')
        if (circle) circle.style.strokeDasharray = `${dash} 999`
      }
    }
    scanner.onPlateDetected = (plates) => {
      // 번호판 bbox를 canvas에 그리기
      const canvas = canvasRef.current
      const video  = videoRef.current
      if (!canvas || !video) return

      const ctx = canvas.getContext('2d')
      canvas.width  = video.videoWidth  || 1280
      canvas.height = video.videoHeight || 720
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      plates.forEach(p => {
        // 번호판 박스
        ctx.strokeStyle = matchStatus === 'matched'
          ? 'rgba(16,185,129,0.9)'   // 초록 — 매칭 완료
          : 'rgba(79,70,229,0.8)'    // 보라 — 탐지 중
        ctx.lineWidth   = 2
        ctx.strokeRect(p.x, p.y, p.w, p.h)

        // 라벨
        ctx.fillStyle = ctx.strokeStyle
        ctx.fillRect(p.x, p.y - 20, 80, 20)
        ctx.fillStyle = '#fff'
        ctx.font      = 'bold 11px sans-serif'
        ctx.fillText(`번호판 ${Math.round(p.score * 100)}%`, p.x + 4, p.y - 5)
      })
    }

    scanner.onCapture = (zoneId, dataUrl, boxes) => {
      setCaptures(prev => ({ ...prev, [zoneId]: { dataUrl, boxes } }))
      setMatchStatus('matched')
      if (canvasRef.current && videoRef.current) {
        drawBoxes(canvasRef.current, videoRef.current, boxes)
      }
      if (boxes.length > 0) {
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2000)
      }
    }

    scanner.startMatching()
    return () => { scannerRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneIndex])

  useEffect(() => {
    if (!scannerRef.current) return
    scannerRef.current.setZone(currentZone)
  }, [currentZone])

  function handleNext() {
    if (zoneIndex < ZONES.length - 1) {
      setZoneIndex(zoneIndex + 1)
    } else {
      setIsDone(true)
    }
  }

  function handleSkip() {
    setCaptures(prev => ({
      ...prev,
      [currentZone.id]: { dataUrl: null, boxes: [] }
    }))
    handleNext()
  }

  const history      = MOCK_HISTORY[currentZone?.id] || []
  const result       = MOCK_RESULTS[currentZone?.id] || { hasDefect: false, count: 0 }
  const totalDefects = Object.values(captures).reduce((a, c) => a + (c.boxes?.length || 0), 0)

  if (isDone) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <span className={styles.headerLogo}>CARCHECK</span>
        </div>
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
              const cap       = captures[z.id]
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
          <button className={styles.btnDone} onClick={() => console.log('완료:', captures)}>
            완료
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <span className={styles.headerLogo}>CARCHECK</span>
        <span className={styles.headerStep}>{zoneIndex + 1} / {ZONES.length} 구역</span>
      </div>

      <div className={styles.stepbar}>
        {ZONES.map((z, i) => {
          const cap = captures[z.id]
          let cls   = ''
          if (i < zoneIndex && cap) cls = (cap.boxes?.length > 0) ? styles.defect : styles.done
          else if (i === zoneIndex) cls = styles.active
          return (
            <div key={z.id} className={`${styles.step} ${cls}`}>
              <div className={styles.stepTrack} />
              <div className={styles.stepLabel}>{z.label}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.zoneHeader}>
        <div>
          <div className={styles.zoneLabel}>촬영 구역</div>
          <div className={styles.zoneTitle}>{currentZone.name}</div>
        </div>
        <div className={`${styles.statusBadge} ${styles[matchStatus]}`}>
          <div className={styles.badgeDot} />
          <span>{matchStatus === 'detecting' ? '인식 중...' : '인식 완료'}</span>
        </div>
      </div>

      <div className={styles.viewWrap}>
        <video ref={videoRef} className={styles.video} playsInline muted />
        <canvas ref={canvasRef} className={styles.overlay} />
        <div className={styles.scanLine} />

        {currentZone.type === 'plate' && (
          <div className={`${styles.guidePlate} ${styles[matchStatus]}`}>
            <div className={styles.guidePlateInner}>
              <div className={`${styles.plateCorner} ${styles.tl}`} />
              <div className={`${styles.plateCorner} ${styles.tr}`} />
              <div className={`${styles.plateCorner} ${styles.bl}`} />
              <div className={`${styles.plateCorner} ${styles.br}`} />
              <span className={styles.plateHint}>번호판</span>
            </div>
            <div className={styles.plateLabelText}>
              {matchStatus === 'matched' ? '✓ 번호판 인식 완료' : '번호판을 이 영역에 맞춰주세요'}
            </div>
          </div>
        )}

        {currentZone.type === 'wheel' && (
          <>
            {currentZone.wheelSide === 'left' && (
              <div className={`${styles.guideWheel} ${styles.left} ${styles[matchStatus]}`}>
                <div className={styles.wheelCircle}>
                  <div className={styles.wheelHub} />
                </div>
                <div className={styles.wheelProgress} ref={wheelLRef}>
                  <svg viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="44" />
                  </svg>
                </div>
                <div className={styles.wheelLabelText}>
                  {matchStatus === 'matched' ? '✓ 인식 완료' : currentZone.label}
                </div>
              </div>
            )}
            {currentZone.wheelSide === 'right' && (
              <div className={`${styles.guideWheel} ${styles.right} ${styles[matchStatus]}`}>
                <div className={styles.wheelCircle}>
                  <div className={styles.wheelHub} />
                </div>
                <div className={styles.wheelProgress} ref={wheelRRef}>
                  <svg viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="44" />
                  </svg>
                </div>
                <div className={styles.wheelLabelText}>
                  {matchStatus === 'matched' ? '✓ 인식 완료' : currentZone.label}
                </div>
              </div>
            )}
          </>
        )}

        <div className={`${styles.saveToast} ${showToast ? styles.visible : ''}`}>
          ✓ 흠집이 저장되었습니다
        </div>

        <div className={styles.liveBadge}>
          <div className={styles.liveDot} />
          <span className={styles.liveText}>LIVE</span>
        </div>
      </div>

      <div className={styles.matchProgress}>
        <div className={styles.matchFill} style={{ width: `${matchValue}%` }} />
      </div>

      <div className={styles.instruction}>
        <div className={styles.instructionIcon}>{currentZone.icon}</div>
        <div
          className={styles.instructionText}
          dangerouslySetInnerHTML={{
            __html: matchStatus === 'matched'
              ? result.hasDefect
                ? `<strong style="color:#ef4444">흠집 ${result.count}개</strong>가 감지되어 저장되었습니다.<br>다음 구역으로 이동하거나 건너뛰세요.`
                : `<strong style="color:#10b981">이상 없음</strong> — 깨끗한 상태입니다.<br>다음 구역으로 이동하세요.`
              : currentZone.instruction
          }}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={handleSkip}>건너뛰기</button>
        <button className={styles.btnNext} onClick={handleNext}>
          {zoneIndex < ZONES.length - 1 ? '다음 구역 →' : '스캔 완료 →'}
        </button>
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
                <div key={i} className={styles.historyCard}>
                  <div className={styles.historyCardImg}>
                    <div
                      className={styles.defectMark}
                      style={{
                        left:   `${18 + i * 8}%`,
                        top:    `${22 + i * 6}%`,
                        width:  '26%',
                        height: '28%',
                      }}
                    />
                  </div>
                  <div className={styles.historyCardInfo}>
                    <div className={styles.historyCardDate}>{h.date}</div>
                    <div className={styles.historyCardCount}>흠집 {h.count}개</div>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}
