// ─────────────────────────────────────────────────────────────
//  scanner.js  —  구역별 촬영 + 카운트다운 관리
//  변경: onCapture 콜백에 boxes 파라미터 추가
//        _capture() async 전환 + inference 호출 연결
// ─────────────────────────────────────────────────────────────

// mock 함수 — inference.js 연동 전까지 사용
async function detectScratches() {
  await new Promise(r => setTimeout(r, 1000)) // 1초 딜레이 (API 흉내)
  return [
    { x: 80,  y: 120, w: 90, h: 70, label: '흠집', score: 0.92 },
    { x: 220, y: 200, w: 60, h: 50, label: '흠집', score: 0.78 },
  ]
}
export class Scanner {
  constructor(videoEl) {
    this.video     = videoEl
    this.zone      = null
    this.captures  = {}     // { zoneId: { base64, dataUrl, boxes } }
    this.isLocked  = false
    this.countdown = 0
    this._timer    = null
    this.onCapture   = null  // (zoneId, dataUrl, boxes) => void  ← boxes 추가
    this.onCountdown = null  // (n) => void
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

  // ── async로 변경: HF API 호출 후 boxes를 콜백에 전달
  async _capture() {
    const snap = document.createElement('canvas')
    snap.width  = this.video.videoWidth  || 1280
    snap.height = this.video.videoHeight || 720
    snap.getContext('2d').drawImage(this.video, 0, 0)

    const dataUrl = snap.toDataURL('image/jpeg', 0.88)
    const base64  = dataUrl.split(',')[1]

    // HF 모델 호출 → bbox 결과
    let boxes = []
    try {
      boxes = await detectScratches(base64)
    } catch (err) {
      console.warn('[Scanner] inference 실패, boxes 빈 배열로 진행', err)
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