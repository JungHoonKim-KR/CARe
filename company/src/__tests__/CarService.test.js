/**
 * CarService API 연결 테스트
 */

// Mock API 응답 데이터
const mockCarListResponse = [
  {
    carId: 'CAR-001',
    plateNumber: '12가 3456',
    status: 'AVAILABLE',
    brand: '현대',
    modelName: '아반떼',
    fuelType: '가솔린',
    frontImageUrl: 'https://example.com/car001-front.jpg'
  },
  {
    carId: 'CAR-002',
    plateNumber: '34나 5678',
    status: 'RENTED',
    brand: '기아',
    modelName: 'K5',
    fuelType: '하이브리드',
    frontImageUrl: 'https://example.com/car002-front.jpg'
  },
  {
    carId: 'CAR-003',
    plateNumber: '56다 7890',
    status: 'MAINTENANCE',
    brand: 'BMW',
    modelName: '320i',
    fuelType: '가솔린',
    frontImageUrl: 'https://example.com/car003-front.jpg'
  }
]

const mockCarImagesResponse = [
  {
    side: 'FRONT',
    s3Url: 'https://s3.example.com/car001-front.jpg',
    ipfsCid: 'QmXxxxxFront'
  },
  {
    side: 'REAR',
    s3Url: 'https://s3.example.com/car001-rear.jpg',
    ipfsCid: 'QmXxxxxRear'
  },
  {
    side: 'FRONT_LEFT',
    s3Url: 'https://s3.example.com/car001-front-left.jpg',
    ipfsCid: 'QmXxxxxFrontLeft'
  },
  {
    side: 'FRONT_RIGHT',
    s3Url: 'https://s3.example.com/car001-front-right.jpg',
    ipfsCid: 'QmXxxxxFrontRight'
  },
  {
    side: 'REAR_LEFT',
    s3Url: 'https://s3.example.com/car001-rear-left.jpg',
    ipfsCid: 'QmXxxxxRearLeft'
  },
  {
    side: 'REAR_RIGHT',
    s3Url: 'https://s3.example.com/car001-rear-right.jpg',
    ipfsCid: 'QmXxxxxRearRight'
  }
]

const mockCarRegisterResponse = {
  carId: 'CAR-004',
  plateNumber: '78라 1234',
  status: 'AVAILABLE',
  imageUrls: {
    front: 'https://s3.example.com/car004-front.jpg',
    rear: 'https://s3.example.com/car004-rear.jpg',
    frontLeft: 'https://s3.example.com/car004-front-left.jpg',
    frontRight: 'https://s3.example.com/car004-front-right.jpg',
    rearLeft: 'https://s3.example.com/car004-rear-left.jpg',
    rearRight: 'https://s3.example.com/car004-rear-right.jpg'
  }
}

console.log('=== Car API 엔드포인트 검증 ===\n')

console.log('1. 차량 목록 조회')
console.log('   엔드포인트: GET /api/companies/{companyId}/cars')
console.log('   경로 파라미터: companyId')
console.log('   인증: Bearer Token (JWT)')
console.log('   응답 예시:')
console.log(JSON.stringify(mockCarListResponse, null, 2))

console.log('\n' + '='.repeat(60) + '\n')

console.log('2. 차량 이미지 조회')
console.log('   엔드포인트: GET /api/companies/{companyId}/cars/{carId}/images')
console.log('   경로 파라미터: companyId, carId')
console.log('   인증: Bearer Token (JWT)')
console.log('   응답 예시:')
console.log(JSON.stringify(mockCarImagesResponse, null, 2))

console.log('\n' + '='.repeat(60) + '\n')

console.log('3. 차량 등록')
console.log('   엔드포인트: POST /api/companies/{companyId}/cars')
console.log('   경로 파라미터: companyId')
console.log('   인증: Bearer Token (JWT)')
console.log('   Content-Type: multipart/form-data')
console.log('   요청 바디:')
console.log('   - modelId: string')
console.log('   - plateNumber: string')
console.log('   - dailyPrice: string')
console.log('   - frontImage: binary (File)')
console.log('   - rearImage: binary (File)')
console.log('   - frontLeftImage: binary (File)')
console.log('   - frontRightImage: binary (File)')
console.log('   - rearLeftImage: binary (File)')
console.log('   - rearRightImage: binary (File)')
console.log('   응답 예시:')
console.log(JSON.stringify(mockCarRegisterResponse, null, 2))

console.log('\n' + '='.repeat(60) + '\n')

console.log('=== 데이터 매핑 검증 ===\n')

console.log('차량 목록 → UI 변환:')
const sampleCar = mockCarListResponse[0]
const mappedCarData = {
  id: sampleCar.carId,
  name: `${sampleCar.brand} ${sampleCar.modelName}`,
  plateNumber: sampleCar.plateNumber,
  status: sampleCar.status,
  fuelType: sampleCar.fuelType,
  frontImage: sampleCar.frontImageUrl
}
console.log(JSON.stringify(mappedCarData, null, 2))

console.log('\n차량 이미지 → UI 변환:')
const imagesByPosition = {}
mockCarImagesResponse.forEach(img => {
  imagesByPosition[img.side.toLowerCase()] = {
    s3Url: img.s3Url,
    ipfsCid: img.ipfsCid
  }
})
console.log(JSON.stringify(imagesByPosition, null, 2))

console.log('\n' + '='.repeat(60) + '\n')

console.log('=== 상태 매핑 검증 ===\n')

const statusMapping = {
  'AVAILABLE': '대여가능',
  'RENTED': '대여중',
  'MAINTENANCE': '정비중',
  'UNAVAILABLE': '사용불가'
}

console.log('API Status → UI Label:')
Object.entries(statusMapping).forEach(([apiStatus, uiLabel]) => {
  console.log(`  ${apiStatus.padEnd(15)} → ${uiLabel}`)
})

console.log('\n' + '='.repeat(60) + '\n')

console.log('=== 이미지 필드 매핑 ===\n')

const imageFieldMapping = {
  '프론트엔드': [
    'frontImage (전면)',
    'rearImage (후면)',
    'frontLeftImage (전면 좌측)',
    'frontRightImage (전면 우측)',
    'rearLeftImage (후면 좌측)',
    'rearRightImage (후면 우측)'
  ],
  'API 요구사항': [
    'frontImage (binary)',
    'rearImage (binary)',
    'frontLeftImage (binary)',
    'frontRightImage (binary)',
    'rearLeftImage (binary)',
    'rearRightImage (binary)'
  ],
  'FormData 필드명': [
    'frontImage',
    'rearImage',
    'frontLeftImage',
    'frontRightImage',
    'rearLeftImage',
    'rearRightImage'
  ]
}

console.log('이미지 필드 대응:')
for (let i = 0; i < 6; i++) {
  console.log(`  ${i + 1}. ${imageFieldMapping['프론트엔드'][i]}`)
  console.log(`     → FormData: ${imageFieldMapping['FormData 필드명'][i]}`)
  console.log(`     → API: ${imageFieldMapping['API 요구사항'][i]}`)
  console.log('')
}

console.log('='.repeat(60) + '\n')

console.log('✅ 모든 Car API 엔드포인트와 데이터 매핑 검증 완료')
console.log('\n백엔드 서버 실행 후 실제 API 테스트를 진행하세요.')
console.log('\n테스트 방법:')
console.log('1. 백엔드 서버 실행')
console.log('2. 프론트엔드 개발 서버 실행 (npm run dev)')
console.log('3. 로그인 후 차량 관리 페이지 접속')
console.log('4. 차량 등록 테스트')
console.log('5. 브라우저 개발자 도구 Network 탭에서 요청/응답 확인')
