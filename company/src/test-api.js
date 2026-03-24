/**
 * API 연결 테스트 스크립트
 *
 * 실행 방법:
 * 1. 브라우저 개발자 도구 콘솔에서 실행
 * 2. 또는 프론트엔드 개발 서버 실행 후 아무 페이지에서 콘솔에 복사/붙여넣기
 */

import ReservationService from './services/ReservationService'
import AuthService from './services/AuthService'

// 테스트 실행 함수
async function testReservationAPIs() {
  console.log('=== 예약 API 연결 테스트 시작 ===\n')

  // 1. 예약 목록 조회 테스트
  console.log('1. 예약 목록 조회 API 테스트')
  console.log('엔드포인트: GET /api/companies/me/reservations')
  try {
    const result = await ReservationService.getReservations({
      page: 0,
      size: 10
    })

    console.log('✅ 요청 성공')
    console.log('응답 구조:', {
      success: result.success,
      dataType: Array.isArray(result.data) ? 'Array' : typeof result.data,
      dataLength: Array.isArray(result.data) ? result.data.length : 'N/A',
      sampleData: result.data?.[0] || result.data
    })

    if (result.success && result.data?.[0]) {
      console.log('첫 번째 예약 데이터 구조:', Object.keys(result.data[0]))
    }
  } catch (error) {
    console.error('❌ 요청 실패:', error.message)
    console.error('에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    })
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // 2. 예약 상세 조회 테스트
  console.log('2. 예약 상세 조회 API 테스트')
  console.log('엔드포인트: GET /api/reservations/{reservationId}')

  const testReservationId = 'test-reservation-id-123'

  try {
    const result = await ReservationService.getReservationDetail(testReservationId)

    console.log('✅ 요청 성공')
    console.log('응답 구조:', {
      success: result.success,
      dataKeys: result.data ? Object.keys(result.data) : null
    })

    if (result.success && result.data) {
      console.log('예약 상세 데이터 구조:', {
        reservationId: result.data.reservationId,
        status: result.data.status,
        hasRenter: !!result.data.renter,
        hasCar: !!result.data.car,
        hasInsurance: !!result.data.insurance,
        renterKeys: result.data.renter ? Object.keys(result.data.renter) : null,
        carKeys: result.data.car ? Object.keys(result.data.car) : null,
        insuranceKeys: result.data.insurance ? Object.keys(result.data.insurance) : null
      })
    }
  } catch (error) {
    console.error('❌ 요청 실패:', error.message)
    console.error('에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    })
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // 3. 예약 생성 테스트 (요청만 구성, 실제 전송 X)
  console.log('3. 예약 생성 API 구조 확인')
  console.log('엔드포인트: POST /api/reservations')
  console.log('요청 바디 구조:', {
    carId: 'string',
    insuranceId: 'string',
    pickupDate: '2026-03-23T23:42:57.375Z',
    returnDate: '2026-03-23T23:42:57.375Z'
  })
  console.log('⚠️  실제 요청은 전송하지 않음 (테스트 데이터 필요)')

  console.log('\n=== API 테스트 완료 ===')
}

// 테스트 실행
testReservationAPIs()

export { testReservationAPIs }
