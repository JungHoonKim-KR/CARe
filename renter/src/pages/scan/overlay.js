// ─────────────────────────────────────────────────────────────
//  overlay.js  —  canvas bbox 드로잉
// ─────────────────────────────────────────────────────────────

export function drawBoxes(canvasEl, videoEl, boxes) {
  const ctx = canvasEl.getContext('2d')
  canvasEl.width  = videoEl.videoWidth  || 1280
  canvasEl.height = videoEl.videoHeight || 720
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  for (const box of boxes) {
    const { x, y, w, h, label, score } = box

    // 박스
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth   = 2
    ctx.strokeRect(x, y, w, h)

    // 라벨 배경
    const tag   = `${label} ${Math.round(score * 100)}%`
    ctx.font    = 'bold 12px Pretendard, sans-serif'
    const textW = ctx.measureText(tag).width
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(x, y - 22, textW + 10, 22)

    // 라벨 텍스트
    ctx.fillStyle = '#ffffff'
    ctx.fillText(tag, x + 5, y - 6)

    // 코너 강조
    const cSize = 10
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth   = 2
    ;[
      [x, y, 1, 1], [x + w, y, -1, 1],
      [x, y + h, 1, -1], [x + w, y + h, -1, -1]
    ].forEach(([cx, cy, dx, dy]) => {
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