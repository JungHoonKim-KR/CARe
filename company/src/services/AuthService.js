import api from './api'

class AuthService {
  // 회원가입
  async register(data) {
    try {
      const response = await api.post('/api/auth/company/register', {
        name: data.companyName,
        email: data.email,
        password: data.password
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '회원가입에 실패했습니다.'
      }
    }
  }

  // 로그인
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/company/login', {
        email,
        password
      })

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '로그인에 실패했습니다.'
      }
    }
  }

  // 로그아웃
  logout() {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  // 현재 로그인 상태 확인
  isAuthenticated() {
    return !!localStorage.getItem('token')
  }

  // 토큰 가져오기
  getToken() {
    return localStorage.getItem('token')
  }
}

export default new AuthService()
