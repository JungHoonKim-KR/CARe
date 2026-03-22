// ─────────────────────────────────────────────────────────────
//  overlay.js  —  canvas bbox 드로잉
//  개선: lerp 보간 + 마지막 결과 유지/페이드아웃 + rAF 렌더링
// ─────────────────────────────────────────────────────────────

// ── 촬영 완료 후 고정 박스 (drawBoxes)
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

let targetBoxes  = []   // WebSocket에서 받은 최신 박스
let currentBoxes = []   // 화면에 실제로 그려지는 박스 (보간 중)
let boxOpacity   = 1    // 페이드아웃용 투명도
let fadeTimer    = null // 페이드 타이머
let rafId        = null // requestAnimationFrame ID
let isRunning    = false

function lerp(a, b, t) { return a + (b - a) * t }

// WebSocket 결과 수신 시 호출
export function updateARBoxes(boxes) {
  if (boxes && boxes.length > 0) {
    targetBoxes = boxes
    boxOpacity  = 1
    clearTimeout(fadeTimer)
    // 1.2초 후 서서히 페이드아웃
    fadeTimer = setTimeout(() => {
      const fade = () => {
        boxOpacity = Math.max(0, boxOpacity - 0.04)
        if (boxOpacity <= 0) {
          targetBoxes  = []
          currentBoxes = []
        }
      }
      const fadeInterval = setInterval(() => {
        fade()
        if (boxOpacity <= 0) clearInterval(fadeInterval)
      }, 30)
    }, 1200)
  }
}

// 박스 좌표 lerp 보간
function interpolateBoxes() {
  if (targetBoxes.length === 0) {
    // 페이드아웃 중이면 currentBoxes 유지
    return
  }

  if (currentBoxes.length !== targetBoxes.length) {
    // 박스 수가 다르면 즉시 교체
    currentBoxes = targetBoxes.map(b => ({ ...b }))
    return
  }

  // 박스 수가 같으면 lerp로 부드럽게 이동
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

// 실제 캔버스에 그리기
function renderARFrame(canvasEl, videoEl) {
  if (!canvasEl || !videoEl) return

  const ctx = canvasEl.getContext('2d')
  canvasEl.width  = videoEl.videoWidth  || 1280
  canvasEl.height = videoEl.videoHeight || 720
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  if (currentBoxes.length === 0) return

  ctx.globalAlpha = boxOpacity

  for (const box of currentBoxes) {
    const { x, y, w, h, label } = box

    // 박스
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)'
    ctx.lineWidth   = 2.5
    ctx.strokeRect(x, y, w, h)

    // 코너 강조
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

    // 라벨
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

// rAF 루프 시작
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

// rAF 루프 정지
export function stopARLoop() {
  isRunning = false
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null }
  targetBoxes  = []
  currentBoxes = []
  boxOpacity   = 1
}

// 기존 호환성 유지 (drawARBoxes 직접 호출 시)
export function drawARBoxes(canvasEl, videoEl, boxes) {
  updateARBoxes(boxes)
}