import api from './api'

class CarService {
  // 차량 등록
  async registerCar(data) {
    try {
      console.log('차량 등록 요청:', {
        modelId: data.modelId,
        plateNumber: data.plateNumber,
        images: '4개 파일'
      })

      const formData = new FormData()
      formData.append('modelId', data.modelId)
      formData.append('plateNumber', data.plateNumber)
      formData.append('frontImage', data.frontImage)
      formData.append('rearImage', data.rearImage)
      formData.append('leftImage', data.leftImage)
      formData.append('rightImage', data.rightImage)

      const response = await api.post('/api/cars/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ 차량 등록 성공:', response.data)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ 차량 등록 에러:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      return {
        success: false,
        message: error.response?.data?.message || '차량 등록에 실패했습니다.'
      }
    }
  }

  // 차량 목록 조회
  async getCarList() {
    try {
      const response = await api.get('/api/cars')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '차량 목록 조회에 실패했습니다.'
      }
    }
  }

  // 차량 상세 조회
  async getCarDetail(carId) {
    try {
      const response = await api.get(`/api/cars/${carId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '차량 정보 조회에 실패했습니다.'
      }
    }
  }
}

export default new CarService()
