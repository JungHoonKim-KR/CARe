import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'ethers'
import careLogo from '../../assets/care_logo.png'
import { registerRenter } from '../../api/auth'
import './AuthForm.css'

export default function SignUpPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.name || !form.password) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      console.log('[SignUp] 요청:', { email: form.email, name: form.name })
      // 임베디드 지갑 자동 생성
      const wallet = Wallet.createRandom()
      localStorage.setItem('embedded_wallet_address', wallet.address)
      localStorage.setItem('embedded_wallet_key', wallet.privateKey)
      console.log('[SignUp] 임베디드 지갑 생성:', wallet.address)

      const data = await registerRenter({
        email: form.email,
        name: form.name,
        password: form.password,
        walletAddress: wallet.address,
      })
      console.log('[SignUp] 응답:', data)

      navigate('/login')
    } catch (err) {
      console.error('[SignUp] 오류:', err.response?.status, err.response?.data)
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
            <label className="form-label">이름</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="Value"
              value={form.name}
              onChange={handleChange}
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
