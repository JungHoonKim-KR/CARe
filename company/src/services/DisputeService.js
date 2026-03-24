import api from './api'

class DisputeService {
  /**
   * 분쟁 목록 조회
   */
  async getDisputes(companyId, params = {}) {
    try {
      const { status, page = 0, size = 20 } = params
      
      let url = `/api/companies/${companyId}/disputes?page=${page}&size=${size}`
      if (status) {
        url += `&status=${status}`
      }

      const response = await api.get(url)

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('분쟁 목록 조회 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '분쟁 목록을 불러오지 못했습니다.'
      }
    }
  }

  /**
   * 분쟁 상세 조회
   */
  async getDisputeDetail(disputeId) {
    try {
      const response = await api.get(`/api/disputes/${disputeId}`)

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('분쟁 상세 조회 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '분쟁 정보를 불러오지 못했습니다.'
      }
    }
  }

  /**
   * 분쟁 생성 (업체가 분쟁 제기)
   */
  async createDispute(reservationId, data) {
    try {
      const response = await api.post(`/api/reservations/${reservationId}/disputes`, {
        reason: data.reason,
        description: data.description,
        claimAmount: data.claimAmount,
        evidenceImages: data.evidenceImages || []
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('분쟁 생성 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '분쟁 제기에 실패했습니다.'
      }
    }
  }

  /**
   * 분쟁 해결 (업체가 분쟁 처리)
   */
  async resolveDispute(disputeId, data) {
    try {
      const response = await api.post(`/api/disputes/${disputeId}/settle`, {
        companyRefundAmount: data.companyRefundAmount,
        renterRefundAmount: data.renterRefundAmount,
        resolution: data.resolution
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('분쟁 해결 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '분쟁 처리에 실패했습니다.'
      }
    }
  }

  /**
   * 분쟁 반려 (업체가 분쟁 거부)
   */
  async rejectDispute(disputeId, reason) {
    try {
      const response = await api.post(`/api/disputes/${disputeId}/reject`, {
        reason
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('분쟁 반려 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '분쟁 반려에 실패했습니다.'
      }
    }
  }

  /**
   * 분쟁 방어 자료 제출 (업체가 반박)
   */
  async submitDefense(disputeId, data) {
    try {
      const response = await api.post(`/api/disputes/${disputeId}/defense`, {
        defenseReason: data.defenseReason,
        evidenceImages: data.evidenceImages || []
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('방어 자료 제출 실패:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '방어 자료 제출에 실패했습니다.'
      }
    }
  }
}

export default new DisputeService()
