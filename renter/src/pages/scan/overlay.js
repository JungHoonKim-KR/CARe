// ─────────────────────────────────────────────────────────────
//  overlay.js  —  canvas bbox 드로잉
//  개선: lerp 보간 + 페이드아웃 + rAF + 히스토리 AR 오버레이
// ─────────────────────────────────────────────────────────────

// ── 촬영 완료 후 고정 박스
export function drawBoxes(canvasEl, videoEl, boxes) {
  const ctx = canvasEl.getContext('2d')
  canvasEl.width  = videoEl.videoWidth  || 1280
  canvasEl.height = videoEl.videoHeight || 720
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  for (const box of boxes) {
    const { x, y, w, h, label, score } = box
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth   = 2
    ctx.strokeRect(x, y, w, h)

    const tag   = `${label} ${Math.round((score || 1) * 100)}%`
    ctx.font    = 'bold 12px Pretendard, sans-serif'
    const textW = ctx.measureText(tag).width
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(x, y - 22, textW + 10, 22)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(tag, x + 5, y - 6)

    const cSize = 10
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth   = 2
    ;[[x, y, 1, 1], [x+w, y, -1, 1], [x, y+h, 1, -1], [x+w, y+h, -1, -1]]
      .forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath()
        ctx.moveTo(cx + dx * cSize, cy)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy + dy * cSize)
        ctx.stroke()
      })
  }
}

export function clearOverlay(canvasEl) {
  if (!canvasEl) return
  const ctx = canvasEl.getContext('2d')
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
}


// ─────────────────────────────────────────────────────────────
//  AR 실시간 박스 — lerp 보간 + 페이드아웃 + rAF
// ─────────────────────────────────────────────────────────────

let targetBoxes   = []
let currentBoxes  = []
let boxOpacity    = 1
let fadeTimer     = null
let rafId         = null
let isRunning     = false

// ── 히스토리 AR 오버레이 상태
let historyOverlay = null  // { x, y, w, h, img, opacity }
let historyFadeDir = 0     // 1: 페이드인, -1: 페이드아웃, 0: 없음
let historyRafId   = null

function lerp(a, b, t) { return a + (b - a) * t }

export function updateARBoxes(boxes) {
  if (boxes && boxes.length > 0) {
    targetBoxes = boxes
    boxOpacity  = 1
    clearTimeout(fadeTimer)
    fadeTimer = setTimeout(() => {
      const fadeInterval = setInterval(() => {
        boxOpacity = Math.max(0, boxOpacity - 0.04)
        if (boxOpacity <= 0) {
          targetBoxes  = []
          currentBoxes = []
          clearInterval(fadeInterval)
        }
      }, 30)
    }, 1200)
  }
}

function interpolateBoxes() {
  if (targetBoxes.length === 0) return
  if (currentBoxes.length !== targetBoxes.length) {
    currentBoxes = targetBoxes.map(b => ({ ...b }))
    return
  }
  currentBoxes = currentBoxes.map((cur, i) => {
    const tgt = targetBoxes[i]
    return {
      ...tgt,
      x: lerp(cur.x, tgt.x, 0.3),
      y: lerp(cur.y, tgt.y, 0.3),
      w: lerp(cur.w, tgt.w, 0.3),
      h: lerp(cur.h, tgt.h, 0.3),
    }
  })
}

function renderARFrame(canvasEl, videoEl) {
  if (!canvasEl || !videoEl) return
  const ctx = canvasEl.getContext('2d')
  canvasEl.width  = videoEl.videoWidth  || 1280
  canvasEl.height = videoEl.videoHeight || 720
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  // ── 히스토리 AR 오버레이 그리기
  if (historyOverlay && historyOverlay.opacity > 0) {
    const { x, y, w, h, img, opacity } = historyOverlay

    // 박스 크기보다 약간 여유있게 표시
    const padding = 20
    const rx = Math.max(0, x - padding)
    const ry = Math.max(0, y - padding)
    const rw = w + padding * 2
    const rh = h + padding * 2

    ctx.save()
    ctx.globalAlpha = opacity * 0.55  // 반투명하게

    // 크롭 이미지를 해당 위치에 표시
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, rx, ry, rw, rh)
    }

    ctx.globalAlpha = opacity

    // 박스 테두리
    ctx.strokeStyle = '#F7A633'
    ctx.lineWidth   = 2
    ctx.setLineDash([6, 3])
    ctx.strokeRect(rx, ry, rw, rh)
    ctx.setLineDash([])

    // 코너 강조
    const cSize = 14
    ctx.strokeStyle = '#F7A633'
    ctx.lineWidth   = 3
    ;[[rx, ry, 1, 1], [rx+rw, ry, -1, 1], [rx, ry+rh, 1, -1], [rx+rw, ry+rh, -1, -1]]
      .forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath()
        ctx.moveTo(cx + dx * cSize, cy)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy + dy * cSize)
        ctx.stroke()
      })

    // 라벨
    ctx.font      = 'bold 11px Pretendard, sans-serif'
    ctx.fillStyle = '#F7A633'
    ctx.fillRect(rx, ry - 20, 60, 20)
    ctx.fillStyle = '#fff'
    ctx.fillText('이전 흠집', rx + 5, ry - 5)

    ctx.restore()
  }

  // ── 실시간 AR 박스
  if (currentBoxes.length === 0) return
  ctx.globalAlpha = boxOpacity

  for (const box of currentBoxes) {
    const { x, y, w, h, label } = box
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)'
    ctx.lineWidth   = 2.5
    ctx.strokeRect(x, y, w, h)

    const cSize = 12
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth   = 3
    ;[[x, y, 1, 1], [x+w, y, -1, 1], [x, y+h, 1, -1], [x+w, y+h, -1, -1]]
      .forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath()
        ctx.moveTo(cx + dx * cSize, cy)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy + dy * cSize)
        ctx.stroke()
      })

    const tag   = label || '흠집'
    ctx.font    = 'bold 11px Pretendard, sans-serif'
    const textW = ctx.measureText(tag).width
    ctx.fillStyle = 'rgba(250, 204, 21, 0.85)'
    ctx.fillRect(x, y - 20, textW + 10, 20)
    ctx.fillStyle = '#000'
    ctx.fillText(tag, x + 5, y - 5)
  }

  ctx.globalAlpha = 1
}

export function startARLoop(canvasEl, videoEl) {
  if (isRunning) return
  isRunning = true
  function loop() {
    interpolateBoxes()
    renderARFrame(canvasEl, videoEl)
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

export function stopARLoop() {
  isRunning = false
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null }
  targetBoxes  = []
  currentBoxes = []
  boxOpacity   = 1
  historyOverlay = null
}

export function drawARBoxes(canvasEl, videoEl, boxes) {
  updateARBoxes(boxes)
}


// ─────────────────────────────────────────────────────────────
//  히스토리 AR 오버레이 — 카드 클릭 시 호출
// ─────────────────────────────────────────────────────────────

/**
 * 히스토리 카드 클릭 시 해당 흠집 위치에 크롭 이미지 AR 표시
 * @param {object|null} scratch - { coordX, coordY, cropS3Url } or null (해제)
 * @param {HTMLVideoElement} videoEl - 카메라 비디오 엘리먼트
 */
export function showHistoryOverlay(scratch, videoEl) {
  if (!scratch) {
    // 해제 — 페이드아웃
    if (historyOverlay) {
      const fadeOut = setInterval(() => {
        if (!historyOverlay) { clearInterval(fadeOut); return }
        historyOverlay.opacity = Math.max(0, historyOverlay.opacity - 0.06)
        if (historyOverlay.opacity <= 0) {
          historyOverlay = null
          clearInterval(fadeOut)
        }
      }, 16)
    }
    return
  }

  const { coordX, coordY, cropS3Url } = scratch

  // 카메라 해상도 기준 좌표 → 박스 크기는 80x60 기본값
  const w = 80, h = 60
  const x = coordX - w / 2
  const y = coordY - h / 2

  // 크롭 이미지 미리 로드
  const img = new Image()
//  img.crossOrigin = 'anonymous'
//  img.src = cropS3Url
historyOverlay = { x, y, w, h, img: null, opacity: 0 }

  // 페이드인
  historyOverlay = { x, y, w, h, img, opacity: 0 }
  const fadeIn = setInterval(() => {
    if (!historyOverlay) { clearInterval(fadeIn); return }
    historyOverlay.opacity = Math.min(1, historyOverlay.opacity + 0.06)
    if (historyOverlay.opacity >= 1) clearInterval(fadeIn)
  }, 16)
}