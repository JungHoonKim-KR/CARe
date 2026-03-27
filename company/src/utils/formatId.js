/**
 * UUID를 짧은 표시 형식으로 변환합니다.
 * UUID (예: "550e8400-e29b-41d4-a716-446655440000") → "#550E8400"
 * 짧은 ID (예: "RES-2603-01") → 그대로 반환
 */
export const shortId = (id) => {
  if (!id || id === '-') return '-'
  if (id.length === 36 && id.charAt(8) === '-') {
    return '#' + id.slice(0, 8).toUpperCase()
  }
  return id
}
