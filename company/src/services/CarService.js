import api from './api'

class CarService {
  /**
   * 차량 목록 조회
   */
  async getCars(companyId) {
    try {
      const response = await api.get(`/api/companies/${companyId}/cars`)

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('차량 목록 조회 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '차량 목록을 불러오지 못했습니다.'
      }
    }
  }

  /**
   * 차량 이미지 조회
   */
  async getCarImages(companyId, carId) {
    try {
      const response = await api.get(`/api/companies/${companyId}/cars/${carId}/images`)

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('차량 이미지 조회 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '차량 이미지를 불러오지 못했습니다.'
      }
    }
  }

  /**
   * 차량 등록
   */
  async registerCar(companyId, carData) {
    try {
      const formData = new FormData()

      formData.append('modelId', carData.modelId)
      formData.append('plateNumber', carData.plateNumber)
      formData.append('dailyPrice', String(carData.dailyPrice))

      // API 스펙에 맞춰 6개 이미지 전송
      formData.append('frontImage', carData.frontImage)
      formData.append('rearImage', carData.rearImage)
      formData.append('frontLeftImage', carData.frontLeftImage)
      formData.append('frontRightImage', carData.frontRightImage)
      formData.append('rearLeftImage', carData.rearLeftImage)
      formData.append('rearRightImage', carData.rearRightImage)

      console.log('===== 차량 등록 요청 시작 =====')
      console.log('companyId:', companyId)
      console.log('request url:', `/api/companies/${companyId}/cars`)

      for (const [key, value] of formData.entries()) {
        console.log('formData:', key, value)
      }

      const response = await api.post(`/api/companies/${companyId}/cars`, formData)

      console.log('===== 차량 등록 성공 =====')
      console.log(response.data)

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('===== 차량 등록 실패 =====')
      console.error('raw error:', error)
      console.error('message:', error?.message)
      console.error('status:', error?.response?.status)
      console.error('response data:', error?.response?.data)
      console.error('request url:', error?.config?.url)

      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          '차량 등록에 실패했습니다.'
      }
    }
  }

  /**
   * 차량 상세 조회 (기존 메서드들)
   */
  async getCarDetail(carId) {
    try {
      const response = await api.get(`/api/cars/${carId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('차량 상세 조회 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '차량 정보를 불러오지 못했습니다.'
      }
    }
  }

  async updateCar(carId, carData) {
    try {
      const response = await api.put(`/api/cars/${carId}`, carData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('차량 수정 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '차량 수정에 실패했습니다.'
      }
    }
  }

  async deleteCar(carId) {
    try {
      const response = await api.delete(`/api/cars/${carId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('차량 삭제 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '차량 삭제에 실패했습니다.'
      }
    }
  }

  /**
   * 차량 반납 리포트 조회 (AI 스크래치 로그)
   */
  async getReturnReport(carId) {
    try {
      const response = await api.get(`/api/cars/${carId}/return-report`)

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('반납 리포트 조회 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '반납 리포트를 불러오지 못했습니다.'
      }
    }
  }
}

export default new CarService()