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
      const data = await loginRenter(form.email, form.password)
      const token = data.accessToken || data.token || data.data?.accessToken
      login(token, data.user || data.data)
      navigate('/home')
    } catch (err) {
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
            <label className="form-label">비밀번호</label>
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
