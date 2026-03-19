import api from './auth'

// 내 예약 목록 조회
export const getMyReservations = async () => {
  const response = await api.get('/api/renter/reservations')
  return response.data
}

// 예약 상세 조회
export const getReservationDetail = async (reservationId) => {
  const response = await api.get(`/api/renter/reservations/${reservationId}`)
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
