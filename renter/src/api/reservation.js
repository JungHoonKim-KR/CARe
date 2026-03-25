import api from './auth'

// 차량 목록 조회
export const getCarList = async ({ brand, airportCode, carSize } = {}) => {
  const params = new URLSearchParams()
  if (brand) params.append('brand', brand)
  if (airportCode) params.append('airportCode', airportCode)
  if (carSize) params.append('carSize', carSize)
  const response = await api.get(`/api/cars${params.toString() ? '?' + params : ''}`)
  return response.data
}

// 차량 상세 조회
export const getCarDetail = async (carId) => {
  const response = await api.get(`/api/cars/${carId}`)
  return response.data
}

// 차량 리뷰 조회
export const getCarReviews = async (carId) => {
  const response = await api.get(`/api/cars/${carId}/reviews`)
  return response.data
}

// 차량 반납 리포트 조회
export const getReturnReport = async (carId, reservationId) => {
  const params = reservationId ? `?reservationId=${reservationId}` : ''
  const response = await api.get(`/api/cars/${carId}/return-report${params}`)
  return response.data
}

// 내 예약 목록 조회
export const getMyReservations = async () => {
  const response = await api.get('/api/renters/me/reservations')
  return response.data
}

// 예약 상세 조회
export const getReservationDetail = async (reservationId) => {
  const response = await api.get(`/api/reservations/${reservationId}`)
  return response.data
}

// 차량 흠집 내역 조회
export const getCarScratches = async (reservationId) => {
  const response = await api.get(`/api/scratch/reservation/${reservationId}`)
  return response.data
}

// 흠집 상세 조회
export const getScratchDetail = async (scratchId) => {
  const response = await api.get(`/api/scratch/${scratchId}`)
  return response.data
}

// 차량 전체 흠집 이력 조회 (해당 차량의 모든 예약 기록)
export const getCarScratchHistory = async (carId) => {
  const response = await api.get(`/api/cars/${carId}/scratches`)
  return response.data
}


// 스마트키 발급
export const issueSmartKey = async (reservationId) => {
  const response = await api.post(`/api/reservations/${reservationId}/smart-key`)
  return response.data
}

// 스마트키 잠금해제
export const unlockSmartKey = async (reservationId) => {
  const response = await api.post(`/api/reservations/${reservationId}/smart-key/unlock`)
  return response.data
}

// 반납 완료 (예약 상태 COMPLETED로 변경)
export const completeReservation = async (reservationId) => {
  const response = await api.post(`/api/reservations/${reservationId}/return`)
  return response.data
}

// 반납 전 스캔 (zone: front | rear | left | right, imageDataUrl: base64)
export const scanBefore = async (reservationId, zone, imageDataUrl) => {
  const formData = new FormData()
  formData.append('zone', zone)
  const blob = await fetch(imageDataUrl).then(r => r.blob())
  formData.append('image', blob, `${zone}.jpg`)
  const response = await api.post(`/api/scan/${reservationId}/before`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// 반납 후 스캔 (zone: front | rear | left | right, imageDataUrl: base64)
export const scanAfter = async (reservationId, zone, imageDataUrl) => {
  const formData = new FormData()
  formData.append('zone', zone)
  const blob = await fetch(imageDataUrl).then(r => r.blob())
  formData.append('image', blob, `${zone}.jpg`)
  const response = await api.post(`/api/scan/${reservationId}/after`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// 분쟁 상세 조회
export const getDisputeDetail = async (reservationId, disputeId) => {
  const response = await api.get(`/api/reservations/${reservationId}/disputes/${disputeId}`)
  return response.data
}

// 예약 생성
export const createReservation = async (carId, insuranceId, pickupDate, pickupTime, returnDate, returnTime) => {
  const toDateTime = (date, time) => {
    if (!date) return null
    const t = time || '10:00'
    return `${date}T${t}:00`
  }
  const response = await api.post('/api/reservations', {
    carId,
    insuranceId,
    pickupDate: toDateTime(pickupDate, pickupTime),
    returnDate: toDateTime(returnDate, returnTime),
  })
  return response.data
}

// 분쟁 이의 신청
export const submitDefense = async (reservationId, disputeId, defenseLogId) => {
  const response = await api.post(
    `/api/reservations/${reservationId}/disputes/${disputeId}/defense`,
    { defenseLogId }
  )
  return response.data
}

export const lockSmartKey = async (reservationId) => {
  const response = await api.post(`/api/reservations/${reservationId}/smart-key/lock`)
  return response.data
}

export const getSmartKeyStatus = async (reservationId) => {
  const response = await api.get(`/api/reservations/${reservationId}/smart-key/status`)
  return response.data
}

export const revokeSmartKey = async (reservationId) => {
  const response = await api.post(`/api/reservations/${reservationId}/smart-key/revoke`)
  return response.data
}
