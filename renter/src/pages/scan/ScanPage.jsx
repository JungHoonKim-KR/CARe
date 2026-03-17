// ─────────────────────────────────────────────────────────────
//  ScanPage.jsx  —  차량 흠집 스캔 메인 페이지
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { Scanner }     from './scanner.js'
import { drawBoxes, clearOverlay } from './overlay.js'
import { ZONES }       from './zones.js'
import styles          from './ScanPage.module.css'

export default function ScanPage() {
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const scannerRef = useRef(null)

  const [zoneIndex,   setZoneIndex]   = useState(0)   // 현재 구역 인덱스
  const [countdown,   setCountdown]   = useState(0)   // 3→2→1→0
  const [isAnalyzing, setIsAnalyzing] = useState(false) // API 호출 중
  const [captures,    setCaptures]    = useState({})   // { zoneId: { dataUrl, boxes } }
  const [isDone,      setIsDone]      = useState(false) // 전체 완료

  const currentZone = ZONES[zoneIndex]

  // ── 카메라 시작
  useEffect(() => {
    let stream = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 1280, height: 720 },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err) {
        console.error('[ScanPage] 카메라 접근 실패', err)
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // ── Scanner 초기화
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const scanner = new Scanner(video)
    scannerRef.current = scanner

    scanner.onCountdown = (n) => {
      setCountdown(n)
    }

    scanner.onCapture = (zoneId, dataUrl, boxes) => {
      setIsAnalyzing(false)
      setCaptures(prev => ({ ...prev, [zoneId]: { dataUrl, boxes } }))

      // bbox 오버레이 그리기
      if (canvasRef.current && videoRef.current) {
        drawBoxes(canvasRef.current, videoRef.current, boxes)
      }

      // 1.5초 후 다음 구역으로 자동 이동
      setTimeout(() => {
        const nextIndex = zoneIndex + 1
        if (nextIndex >= ZONES.length) {
          setIsDone(true)
        } else {
          setZoneIndex(nextIndex)
          clearOverlay(canvasRef.current)
        }
      }, 1500)
    }

    return () => {
      scannerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneIndex])

  // ── 구역 바뀔 때 Scanner에 zone 세팅
  useEffect(() => {
    if (!scannerRef.current) return
    scannerRef.current.setZone(currentZone)
  }, [currentZone])

  // ── 촬영 버튼
  function handleCapture() {
    if (!scannerRef.current || isAnalyzing) return
    setIsAnalyzing(true)
    scannerRef.current.lock()
  }

  // ── 재촬영 버튼
  function handleRetake() {
    if (!scannerRef.current) return
    clearOverlay(canvasRef.current)
    setCaptures(prev => {
      const next = { ...prev }
      delete next[currentZone.id]
      return next
    })
    scannerRef.current.unlock()
    scannerRef.current.setZone(currentZone)
  }

  const currentCapture = captures[currentZone?.id]

  return (
    <div className={styles.page}>

      {/* 구역 진행 표시 */}
      <div className={styles.progress}>
        {ZONES.map((z, i) => (
          <div
            key={z.id}
            className={[
              styles.step,
              i < zoneIndex         ? styles.done    : '',
              i === zoneIndex       ? styles.active  : '',
              captures[z.id]?.boxes?.length > 0 ? styles.hasDefect : '',
            ].join(' ')}
          >
            <span className={styles.stepDot} />
            <span className={styles.stepLabel}>{z.label}</span>
          </div>
        ))}
      </div>

      {!isDone ? (
        <>
          {/* 현재 구역 안내 */}
          <div className={styles.zoneTitle}>
            {currentZone.label} 촬영
          </div>

          {/* 카메라 뷰 */}
          <div className={styles.viewWrapper}>
            <video
              ref={videoRef}
              className={styles.video}
              playsInline
              muted
            />
            {/* bbox 오버레이 canvas */}
            <canvas
              ref={canvasRef}
              className={styles.overlay}
            />

            {/* 카운트다운 표시 */}
            {countdown > 0 && (
              <div className={styles.countdown}>{countdown}</div>
            )}

            {/* 분석 중 표시 */}
            {isAnalyzing && countdown === 0 && (
              <div className={styles.analyzing}>분석 중...</div>
            )}
          </div>

          {/* 버튼 */}
          <div className={styles.actions}>
            {!currentCapture ? (
              <button
                className={styles.captureBtn}
                onClick={handleCapture}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '분석 중...' : '촬영'}
              </button>
            ) : (
              <button
                className={styles.retakeBtn}
                onClick={handleRetake}
              >
                재촬영
              </button>
            )}
          </div>

          {/* 캡처된 썸네일 + 결과 */}
          {currentCapture && (
            <div className={styles.result}>
              <img
                src={currentCapture.dataUrl}
                alt={currentZone.label}
                className={styles.thumbnail}
              />
              <p className={styles.resultText}>
                {currentCapture.boxes.length > 0
                  ? `흠집 ${currentCapture.boxes.length}개 감지됨`
                  : '흠집 없음'}
              </p>
            </div>
          )}
        </>
      ) : (
        /* 전체 완료 화면 */
        <div className={styles.summary}>
          <h2>스캔 완료</h2>
          <div className={styles.summaryGrid}>
            {ZONES.map(z => {
              const cap = captures[z.id]
              return (
                <div key={z.id} className={styles.summaryCard}>
                  <img src={cap?.dataUrl} alt={z.label} />
                  <p>{z.label}</p>
                  <p className={cap?.boxes?.length > 0 ? styles.defect : styles.clean}>
                    {cap?.boxes?.length > 0
                      ? `흠집 ${cap.boxes.length}개`
                      : '이상 없음'}
                  </p>
                </div>
              )
            })}
          </div>
          <button
            className={styles.captureBtn}
            onClick={() => {
              /* TODO: 결과를 다음 페이지로 넘기거나 API 저장 */
              console.log('최종 결과:', captures)
            }}
          >
            완료
          </button>
        </div>
      )}
    </div>
  )
}