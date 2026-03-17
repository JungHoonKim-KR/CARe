import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import careLogo from '../../assets/care_logo.png'
import './AuthForm.css'

export default function SignUpPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.nickname || !form.password || !form.confirmPassword) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    try {
      // TODO: 회원가입 API 연결
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || '회원가입에 실패했습니다.'
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
            <label className="form-label">닉네임</label>
            <input
              className="form-input"
              type="text"
              name="nickname"
              placeholder="Value"
              value={form.nickname}
              onChange={handleChange}
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
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="Value"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary form-submit"
            disabled={loading}
          >
            {loading ? '처리 중...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}
