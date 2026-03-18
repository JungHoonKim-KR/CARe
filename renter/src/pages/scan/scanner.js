// ─────────────────────────────────────────────────────────────
//  scanner.js  —  구역별 촬영 + 카운트다운 관리
//  변경: mock detectScratches → Spring Boot API 호출로 교체
// ─────────────────────────────────────────────────────────────

const SPRING_BOOT_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function detectScratches(base64, zoneId, reservationId, logType) {
  // base64 → Blob
  const binary = atob(base64)
  const arr    = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  const blob = new Blob([arr], { type: 'image/jpeg' })

  // FormData 구성
  const formData = new FormData()
  formData.append('image', blob, 'capture.jpg')
  formData.append('zone', zoneId)

  // Spring Boot API 호출
  const endpoint = logType === 'AFTER'
    ? `${SPRING_BOOT_URL}/scan/${reservationId}/after`
    : `${SPRING_BOOT_URL}/scan/${reservationId}/before`

  const res = await fetch(endpoint, {
    method: 'POST',
    body:   formData,
  })

  if (!res.ok) throw new Error(`API 오류 ${res.status}`)

  // 응답: [{ logId, carPart, coordX, coordY, cropS3Url, ... }]
  const scratches = await res.json()

  // bbox 형태로 변환 (overlay.js 호환)
  return scratches.map(s => ({
    x:     s.coordX,
    y:     s.coordY,
    w:     80,       // S3 크롭 이미지라 bbox 크기는 고정
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
    this.reservationId = reservationId   // ← 추가
    this.logType       = logType         // ← 추가 (BEFORE / AFTER)
    this.zone          = null
    this.captures      = {}
    this.isLocked      = false
    this.countdown     = 0
    this._timer        = null
    this.onCapture     = null  // (zoneId, dataUrl, boxes) => void
    this.onCountdown   = null  // (n) => void
  }

  setZone(zone) {
    this.zone      = zone
    this.isLocked  = false
    this.countdown = 0
    clearInterval(this._timer)
  }

  lock() {
    if (this.isLocked || !this.zone) return
    this.isLocked  = true
    this.countdown = 3
    if (this.onCountdown) this.onCountdown(3)

    this._timer = setInterval(() => {
      this.countdown--
      if (this.onCountdown) this.onCountdown(this.countdown)
      if (this.countdown <= 0) {
        clearInterval(this._timer)
        this._capture()
      }
    }, 1000)
  }

  unlock() {
    this.isLocked  = false
    this.countdown = 0
    clearInterval(this._timer)
    if (this.onCountdown) this.onCountdown(0)
  }

  async _capture() {
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
      console.warn('[Scanner] API 호출 실패, boxes 빈 배열로 진행', err)
    }

    this.captures[this.zone.id] = { base64, dataUrl, boxes }
    if (this.onCapture) this.onCapture(this.zone.id, dataUrl, boxes)
  }

  getCapture(zoneId)  { return this.captures[zoneId] }
  isDone(zoneId)      { return !!this.captures[zoneId] }
  isAllDone(zones)    { return zones.every(z => this.captures[z.id]) }

  reset() {
    this.captures  = {}
    this.isLocked  = false
    this.countdown = 0
    clearInterval(this._timer)
  }
}