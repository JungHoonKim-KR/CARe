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

// 분쟁 상세 조회
export const getDisputeDetail = async (reservationId, disputeId) => {
  const response = await api.get(`/api/reservations/${reservationId}/disputes/${disputeId}`)
  return response.data
}

// 예약 생성
export const createReservation = async (carId, insuranceId, totalPrice, pickupDate, pickupTime, returnDate, returnTime) => {
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
