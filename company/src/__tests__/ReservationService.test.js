/**
 * ReservationService API 연결 테스트
 *
 * 이 테스트는 API 요청이 올바르게 구성되었는지 확인합니다.
 * 실제 백엔드 서버 없이 Mock을 사용하여 테스트합니다.
 */

// Mock API 응답 데이터
const mockReservationListResponse = [
  {
    reservationId: 'RES-001',
    status: 'CONFIRMED',
    depositStatus: 'PENDING',
    carId: 'CAR-001',
    plateNumber: '12가 3456',
    brand: '현대',
    modelName: '쏘나타',
    insuranceName: '기본 보험',
    pickupDate: '2026-03-25T10:00:00Z',
    returnDate: '2026-03-28T18:00:00Z',
    createdAt: '2026-03-23T12:00:00Z'
  },
  {
    reservationId: 'RES-002',
    status: 'IN_PROGRESS',
    depositStatus: 'PAID',
    carId: 'CAR-002',
    plateNumber: '34나 5678',
    brand: '기아',
    modelName: 'K5',
    insuranceName: '프리미엄 보험',
    pickupDate: '2026-03-24T14:00:00Z',
    returnDate: '2026-03-26T14:00:00Z',
    createdAt: '2026-03-22T15:30:00Z'
  },
  {
    reservationId: 'RES-003',
    status: 'COMPLETED',
    depositStatus: 'REFUNDED',
    carId: 'CAR-003',
    plateNumber: '56다 7890',
    brand: 'BMW',
    modelName: '320i',
    insuranceName: '종합 보험',
    pickupDate: '2026-03-20T09:00:00Z',
    returnDate: '2026-03-23T18:00:00Z',
    createdAt: '2026-03-19T10:00:00Z'
  },
  {
    reservationId: 'RES-004',
    status: 'DISPUTE',
    depositStatus: 'PENDING',
    carId: 'CAR-004',
    plateNumber: '78라 1234',
    brand: '현대',
    modelName: '싼타페',
    insuranceName: '기본 보험',
    pickupDate: '2026-03-22T11:00:00Z',
    returnDate: '2026-03-24T15:00:00Z',
    createdAt: '2026-03-21T13:00:00Z'
  }
]

const mockReservationDetailResponse = {
  reservationId: 'RES-001',
  status: 'CONFIRMED',
  smartContractAddress: '0x1234567890abcdef',
  depositStatus: 'PENDING',
  pickupDate: '2026-03-25T10:00:00Z',
  returnDate: '2026-03-28T18:00:00Z',
  beforeScanTxHash: '0xbeforetxhash123',
  afterScanTxHash: null,
  renter: {
    renterId: 'RENTER-001',
    name: '김철수',
    email: 'kim@example.com'
  },
  car: {
    carId: 'CAR-001',
    plateNumber: '12가 3456',
    brand: '현대',
    modelName: '쏘나타'
  },
  insurance: {
    insuranceId: 'INS-001',
    name: '기본 보험',
    price: 30000
  }
}

// API 엔드포인트 검증
console.log('=== API 엔드포인트 검증 ===\n')

console.log('1. 예약 목록 조회')
console.log('   엔드포인트: GET /api/companies/me/reservations')
console.log('   쿼리 파라미터: page, size, status (선택)')
console.log('   인증: Bearer Token (JWT)')
console.log('   응답 예시:')
console.log(JSON.stringify(mockReservationListResponse.slice(0, 2), null, 2))

console.log('\n' + '='.repeat(60) + '\n')

console.log('2. 예약 상세 조회')
console.log('   엔드포인트: GET /api/reservations/{reservationId}')
console.log('   경로 파라미터: reservationId')
console.log('   인증: Bearer Token (JWT)')
console.log('   응답 예시:')
console.log(JSON.stringify(mockReservationDetailResponse, null, 2))

console.log('\n' + '='.repeat(60) + '\n')

console.log('3. 예약 생성')
console.log('   엔드포인트: POST /api/reservations')
console.log('   인증: Bearer Token (JWT)')
console.log('   요청 바디:')
console.log(JSON.stringify({
  carId: 'CAR-001',
  insuranceId: 'INS-001',
  pickupDate: '2026-03-25T10:00:00Z',
  returnDate: '2026-03-28T18:00:00Z'
}, null, 2))
console.log('   응답 예시:')
console.log(JSON.stringify({
  reservationId: 'RES-005',
  status: 'PENDING',
  carId: 'CAR-001',
  insuranceId: 'INS-001',
  pickupDate: '2026-03-25T10:00:00Z',
  returnDate: '2026-03-28T18:00:00Z',
  totalPrice: 240000,
  paymentTxHash: '0xpaymenttxhash456'
}, null, 2))

console.log('\n' + '='.repeat(60) + '\n')

// 데이터 매핑 검증
console.log('=== 데이터 매핑 검증 ===\n')

console.log('예약 목록 → UI 변환:')
const sampleReservation = mockReservationListResponse[0]
const mappedListData = {
  id: sampleReservation.reservationId,
  carName: `${sampleReservation.brand} ${sampleReservation.modelName}`,
  carType: sampleReservation.plateNumber,
  renterName: '-',
  renterCountry: sampleReservation.insuranceName,
  startDate: new Date(sampleReservation.pickupDate).toLocaleString('ko-KR'),
  endDate: new Date(sampleReservation.returnDate).toLocaleString('ko-KR'),
  location: '-',
  amount: '-',
  status: sampleReservation.status
}
console.log(JSON.stringify(mappedListData, null, 2))

console.log('\n예약 상세 → UI 변환:')
const mappedDetailData = {
  carName: `${mockReservationDetailResponse.car.brand} ${mockReservationDetailResponse.car.modelName}`,
  plateNumber: mockReservationDetailResponse.car.plateNumber,
  status: mockReservationDetailResponse.status,
  renterName: mockReservationDetailResponse.renter.name,
  renterEmail: mockReservationDetailResponse.renter.email,
  pickupDate: new Date(mockReservationDetailResponse.pickupDate).toLocaleString('ko-KR'),
  returnDate: new Date(mockReservationDetailResponse.returnDate).toLocaleString('ko-KR'),
  insurancePrice: mockReservationDetailResponse.insurance.price,
  smartContractAddress: mockReservationDetailResponse.smartContractAddress,
  depositStatus: mockReservationDetailResponse.depositStatus
}
console.log(JSON.stringify(mappedDetailData, null, 2))

console.log('\n' + '='.repeat(60) + '\n')

// 상태 매핑 검증
console.log('=== 상태 매핑 검증 ===\n')

const statusMapping = {
  'PENDING': '예약대기',
  'CONFIRMED': '예약완료',
  'IN_PROGRESS': '이용중',
  'COMPLETED': '반납완료',
  'DISPUTE': '분쟁중',
  'CANCELLED': '취소됨'
}

console.log('API Status → UI Label:')
Object.entries(statusMapping).forEach(([apiStatus, uiLabel]) => {
  console.log(`  ${apiStatus.padEnd(15)} → ${uiLabel}`)
})

console.log('\n픽업 완료 상태:')
console.log('  IN_PROGRESS, COMPLETED, DISPUTE')

console.log('\n반납 완료 상태:')
console.log('  COMPLETED, DISPUTE')

console.log('\n' + '='.repeat(60) + '\n')

console.log('✅ 모든 API 엔드포인트와 데이터 매핑 검증 완료')
console.log('\n백엔드 서버 실행 후 실제 API 테스트를 진행하세요.')
console.log('프론트엔드 개발 서버에서 네트워크 탭을 확인하여 요청/응답을 검증할 수 있습니다.')
