// ─────────────────────────────────────────────────────────────
//  overlay.js  —  canvas에 bbox 실시간 드로잉
//  캡처 후 결과 boxes를 받아 video 위 canvas에 그림
// ─────────────────────────────────────────────────────────────

/**
 * 캡처 결과 boxes를 canvas에 한 번 그린다
 * @param {HTMLCanvasElement} canvasEl
 * @param {HTMLVideoElement}  videoEl
 * @param {Array<{ x, y, w, h, label, score }>} boxes
 */
export function drawBoxes(canvasEl, videoEl, boxes) {
  const ctx = canvasEl.getContext('2d')
  canvasEl.width  = videoEl.videoWidth  || 1280
  canvasEl.height = videoEl.videoHeight || 720
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  for (const box of boxes) {
    const { x, y, w, h, label, score } = box

    // 박스 테두리
    ctx.strokeStyle = '#FF3B30'
    ctx.lineWidth   = 2
    ctx.strokeRect(x, y, w, h)

    // 라벨 배경
    const tag = `${label} ${Math.round(score * 100)}%`
    ctx.font = 'bold 13px sans-serif'
    const textW = ctx.measureText(tag).width
    ctx.fillStyle = 'rgba(255, 59, 48, 0.82)'
    ctx.fillRect(x, y - 22, textW + 10, 22)

    // 라벨 텍스트
    ctx.fillStyle = '#ffffff'
    ctx.fillText(tag, x + 5, y - 6)
  }
}

/**
 * canvas를 완전히 지운다 (구역 이동 시 호출)
 * @param {HTMLCanvasElement} canvasEl
 */
export function clearOverlay(canvasEl) {
  const ctx = canvasEl.getContext('2d')
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
}