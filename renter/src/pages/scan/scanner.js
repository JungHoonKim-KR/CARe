// ─────────────────────────────────────────────────────────────
//  scanner.js  —  카메라 캡처 + Spring Boot API 호출
//  번호판 구역: 실제 모델 인식 / 바퀴 구역: 타이머
// ─────────────────────────────────────────────────────────────

import {
  loadPlateDetector,
  detectPlate,
  isPlateInGuide,
  getGuideBoxInVideoCoords,
} from './plateDetector.js'

const SPRING_BOOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const WHEEL_MATCH_TIME = 2500  // 바퀴 타이머 ms
const PLATE_CHECK_INTERVAL = 500  // 번호판 탐지 주기 ms

async function detectScratches(base64, zoneId, reservationId, logType) {
  const binary = atob(base64)
  const arr    = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  const blob = new Blob([arr], { type: 'image/jpeg' })

  const formData = new FormData()
  formData.append('image', blob, 'capture.jpg')
  formData.append('zone', zoneId)

  const endpoint = logType === 'AFTER'
    ? `${SPRING_BOOT_URL}/scan/${reservationId}/after`
    : `${SPRING_BOOT_URL}/scan/${reservationId}/before`

  const res = await fetch(endpoint, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`API 오류 ${res.status}`)

  const scratches = await res.json()
  return scratches.map(s => ({
    x:     s.coordX,
    y:     s.coordY,
    w:     80,
    h:     60,
    label: '흠집',
    score: 1.0,
    cropS3Url:     s.cropS3Url,
    originalS3Url: s.originalS3Url,
  }))
}

export class Scanner {
  constructor(videoEl, reservationId, logType = 'BEFORE') {
    this.video         = videoEl
    this.reservationId = reservationId
    this.logType       = logType
    this.zone          = null
    this.captures      = {}
    this._matchTimer   = null
    this._plateLoop    = null
    this._matchValue   = 0
    this._isMatching   = false

    this.onCapture   = null  // (zoneId, dataUrl, boxes) => void
    this.onMatching  = null  // (progress 0~100) => void
    this.onPlateDetected = null  // (plates) => void — bbox 시각화용

    // 번호판 모델 미리 로드
    loadPlateDetector()
  }

  setZone(zone) {
    this.zone        = zone
    this._matchValue = 0
    this._isMatching = false
    this._clearTimers()
  }

  // ── 매칭 시작 (구역 타입에 따라 분기)
  startMatching() {
    if (!this.zone) return
    this._clearTimers()
    this._matchValue = 0
    this._isMatching = true

    if (this.zone.type === 'plate') {
      this._startPlateMatching()
    } else {
      this._startWheelMatching()
    }
  }

  // ── 번호판 인식 루프
  _startPlateMatching() {
    let lastCheck = 0

    const loop = async (timestamp) => {
      if (!this._isMatching) return
      this._plateLoop = requestAnimationFrame(loop)

      if (timestamp - lastCheck < PLATE_CHECK_INTERVAL) return
      lastCheck = timestamp

      const video = this.video
      if (!video || video.readyState < 2) return

      const plates = await detectPlate(video)

      // bbox 시각화 콜백
      if (this.onPlateDetected) this.onPlateDetected(plates)

      if (plates.length === 0) return

      // 가이드박스와 overlap 확인
      const guide = getGuideBoxInVideoCoords(video)
      const matched = plates.some(p => isPlateInGuide(p, guide, 0.6))

      if (matched) {
        // 매칭 완료 → 진행바 100%
        this._matchValue = 100
        if (this.onMatching) this.onMatching(100)
        this._isMatching = false
        cancelAnimationFrame(this._plateLoop)
        this._capture()
      } else {
        // 가이드박스 근접도로 진행바 표시
        const guide2 = getGuideBoxInVideoCoords(video)
        const best   = plates.reduce((max, p) => {
          const overlap = this._overlapRatio(p, guide2)
          return overlap > max ? overlap : max
        }, 0)
        this._matchValue = Math.min(best * 120, 95) // 최대 95%까지
        if (this.onMatching) this.onMatching(this._matchValue)
      }
    }

    this._plateLoop = requestAnimationFrame(loop)
  }

  // ── 바퀴 타이머 매칭
  _startWheelMatching() {
    const interval = 50
    const steps    = WHEEL_MATCH_TIME / interval
    let   step     = 0

    this._matchTimer = setInterval(() => {
      if (!this._isMatching) { clearInterval(this._matchTimer); return }
      step++
      this._matchValue = (step / steps) * 100
      if (this.onMatching) this.onMatching(this._matchValue)

      if (step >= steps) {
        clearInterval(this._matchTimer)
        this._isMatching = false
        this._capture()
      }
    }, interval)
  }

  // ── overlap 비율 계산 (내부용)
  _overlapRatio(plate, guide) {
    const ix1 = Math.max(plate.x, guide.x)
    const iy1 = Math.max(plate.y, guide.y)
    const ix2 = Math.min(plate.x + plate.w, guide.x + guide.w)
    const iy2 = Math.min(plate.y + plate.h, guide.y + guide.h)
    if (ix2 <= ix1 || iy2 <= iy1) return 0
    const intersection = (ix2 - ix1) * (iy2 - iy1)
    return intersection / (plate.w * plate.h)
  }

  stopMatching() {
    this._isMatching = false
    this._clearTimers()
  }

  unlock() {
    this._isMatching = false
    this._matchValue = 0
    this._clearTimers()
    if (this.onMatching) this.onMatching(0)
  }

  _clearTimers() {
    if (this._matchTimer) {
      clearInterval(this._matchTimer)
      this._matchTimer = null
    }
    if (this._plateLoop) {
      cancelAnimationFrame(this._plateLoop)
      this._plateLoop = null
    }
  }

  async _capture() {
    if (!this.video || !this.zone) return
    const snap = document.createElement('canvas')
    snap.width  = this.video.videoWidth  || 1280
    snap.height = this.video.videoHeight || 720
    snap.getContext('2d').drawImage(this.video, 0, 0)

    const dataUrl = snap.toDataURL('image/jpeg', 0.88)
    const base64  = dataUrl.split(',')[1]

    let boxes = []
    try {
      boxes = await detectScratches(
        base64,
        this.zone.id,
        this.reservationId,
        this.logType
      )
    } catch (err) {
      console.warn('[Scanner] API 호출 실패:', err)
    }

    this.captures[this.zone.id] = { base64, dataUrl, boxes }
    if (this.onCapture) this.onCapture(this.zone.id, dataUrl, boxes)
  }

  getCapture(zoneId)  { return this.captures[zoneId] }
  isDone(zoneId)      { return !!this.captures[zoneId] }
  isAllDone(zones)    { return zones.every(z => this.captures[z.id]) }

  reset() {
    this._isMatching = false
    this._matchValue = 0
    this.captures    = {}
    this._clearTimers()
  }
}