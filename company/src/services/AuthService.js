import api from './api'

class AuthService {
  decodeJwtPayload(token) {
    try {
      if (!token) return null

      const payloadBase64 = token.split('.')[1]
      if (!payloadBase64) return null

      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
      const decoded = decodeURIComponent(
        atob(base64)
          .split('')
          .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      )

      return JSON.parse(decoded)
    } catch (error) {
      console.error('JWT 디코딩 실패:', error)
      return null
    }
  }

  async register(data) {
    try {
      const response = await api.post('/api/auth/company/register', {
        name: data.companyName,
        airportCode: data.airportCode,
        languageCode: data.languageCode,
        email: data.email,
        password: data.password
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('회원가입 에러:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '회원가입에 실패했습니다.'
      }
    }
  }

  async login(email, password) {
    try {
      const response = await api.post('/api/auth/company/login', {
        email,
        password
      })

      console.log('로그인 응답 전체:', response.data)

      const accessToken =
        response.data.accessToken ||
        response.data.accesstoken ||
        response.data.token

      const refreshToken =
        response.data.refreshToken ||
        response.data.refreshtoken

      let companyId =
        response.data.companyId ||
        response.data.companyUUID ||
        response.data.id ||
        response.data.company?.companyId ||
        response.data.company?.id

      if (accessToken) {
        localStorage.setItem('token', accessToken)

        if (!companyId) {
          const payload = this.decodeJwtPayload(accessToken)
          console.log('JWT payload:', payload)
          companyId = payload?.sub || null
        }
      }

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      if (companyId) {
        localStorage.setItem('companyId', companyId)
      }

      console.log('저장된 token:', localStorage.getItem('token'))
      console.log('저장된 companyId:', localStorage.getItem('companyId'))

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('로그인 에러:', error)
      return {
        success: false,
        message: error?.response?.data?.message || '로그인에 실패했습니다.'
      }
    }
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('companyId')
    window.location.href = '/company/login'
  }

  isAuthenticated() {
    return !!localStorage.getItem('token')
  }

  getToken() {
    return localStorage.getItem('token')
  }

  getCompanyId() {
    const savedCompanyId = localStorage.getItem('companyId')
    if (savedCompanyId) return savedCompanyId

    const token = localStorage.getItem('token')
    if (!token) return null

    const payload = this.decodeJwtPayload(token)
    const companyId = payload?.sub || null

    if (companyId) {
      localStorage.setItem('companyId', companyId)
    }

    return companyId
  }
}

export default new AuthService()