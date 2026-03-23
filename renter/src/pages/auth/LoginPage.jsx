import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import { loginRenter } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import './AuthForm.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      console.log('[Login] 요청:', { email: form.email })
      const data = await loginRenter(form.email, form.password)
      console.log('[Login] 응답:', data)
      const accessToken  = data.accessToken  || data.data?.accessToken
      const refreshToken = data.refreshToken || data.data?.refreshToken
      const userData     = data.user         || data.data?.user || null
      console.log('[Login] accessToken:', accessToken)
      // 백엔드 응답에 user 없으면 이메일을 직접 저장
      const userInfo = userData || { email: form.email }

      // 이전 계정 서류 인증 상태 초기화
      localStorage.removeItem('passport_verified')
      localStorage.removeItem('license_verified')
      localStorage.removeItem('did_name')
      localStorage.removeItem('did_docId')
      localStorage.removeItem('did_expiry')

      login(accessToken, refreshToken, userInfo)

      // 백엔드에서 언어 설정 + 서류 인증 상태 로드
      try {
        const profile = await getRenterProfile()
        const lang = profile?.languageCode || profile?.data?.languageCode
        if (lang) {
          localStorage.setItem('language', lang)
          i18n.changeLanguage(lang)
        }
        // 실제 인증 상태로 localStorage 업데이트
        const docs = profile?.documents ?? []
        const passportDone = docs.some(d => d.docType === 'PASSPORT' && d.verified)
        const licenseDone = docs.some(d => d.docType === 'INT_LICENSE' && d.verified)
        localStorage.setItem('passport_verified', passportDone ? 'true' : 'false')
        localStorage.setItem('license_verified', licenseDone ? 'true' : 'false')
      } catch {
        // 프로필 로드 실패 시 무시
      }

      navigate('/home')
    } catch (err) {
      console.error('[Login] 오류:', err.response?.status, err.response?.data)
      const msg = err.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-logo-section">
        <img src={careLogo} alt="CARe" className="auth-logo" />
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Value"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호 (8자 이상)</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Value"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary form-submit"
            disabled={loading}
          >
            {loading ? '로그인 중...' : 'Sign In'}
          </button>
        </form>

        <Link to="/forgot-password" className="auth-link">
          비밀번호를 잊어버리셨나요?
        </Link>
      </div>
    </div>
  )
}
