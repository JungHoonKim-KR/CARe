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

// 기존 drawBoxes, clearOverlay 함수는 그대로 두시고, 맨 아래에 추가하세요!

export function drawARBoxes(canvasEl, videoEl, boxes) {
  if (!canvasEl || !videoEl) return;
  const ctx = canvasEl.getContext('2d')
  canvasEl.width  = videoEl.videoWidth  || 1280
  canvasEl.height = videoEl.videoHeight || 720
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  for (const box of boxes) {
    const { x, y, w, h, label } = box

    // 🌟 AR 전용 스타일 (시야를 덜 가리도록 반투명 노란색 적용)
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)' // 옐로우
    ctx.lineWidth   = 3
    ctx.strokeRect(x, y, w, h)

    const tag = label || '흠집 탐지 중'
    ctx.font = 'bold 12px Pretendard, sans-serif'
    const textW = ctx.measureText(tag).width

    ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'
    ctx.fillRect(x, y - 22, textW + 10, 22)

    ctx.fillStyle = '#000000'
    ctx.fillText(tag, x + 5, y - 6)
  }
}