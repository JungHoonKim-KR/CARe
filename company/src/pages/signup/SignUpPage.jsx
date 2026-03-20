import React, { useState } from 'react'
import './SignUpPage.css'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    businessNumber: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    console.log('Sign up attempt:', formData)
    // TODO: API 연동
  }

  const handleSocialSignUp = (provider) => {
    console.log('Social sign up:', provider)
    // TODO: 소셜 회원가입 구현
  }

  return (
    <div className="signup-container">
      {/* Left Side - Image */}
      <div className="signup-image-section">
        <div className="signup-logo">CARe</div>
      </div>

      {/* Right Side - Form */}
      <div className="signup-form-section">
        <div className="signup-form-wrapper">
          <h1 className="signup-title">
            회원가입
          </h1>
          <p className="signup-subtitle">
            CARe와 함께 렌터카 사업을 시작해보세요.
            빠르고 간편한 회원가입으로 시작하세요.
          </p>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="businessNumber">사업자 등록번호</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="businessNumber"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  placeholder="123-45-67890"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="companyName">회사명</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="주식회사 CARe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Id</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="company@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Password 확인</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="signup-button">
              SIGN UP
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-signup">
            <button
              type="button"
              className="social-button google"
              onClick={() => handleSocialSignUp('google')}
              aria-label="Sign up with Google"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18.1713 8.36791H17.5001V8.33334H10.0001V11.6667H14.7096C14.023 13.6071 12.1763 15 10.0001 15C7.23885 15 5.00010 12.7613 5.00010 10C5.00010 7.23876 7.23885 5.00001 10.0001 5.00001C11.2746 5.00001 12.4342 5.48084 13.3171 6.26626L15.6742 3.90917C14.1859 2.52209 12.1951 1.66667 10.0001 1.66667C5.39802 1.66667 1.66677 5.39792 1.66677 10C1.66677 14.6021 5.39802 18.3333 10.0001 18.3333C14.6022 18.3333 18.3334 14.6021 18.3334 10C18.3334 9.44126 18.2759 8.89584 18.1713 8.36791Z" fill="#FFC107"/>
                <path d="M2.62756 6.12125L5.36548 8.12917C6.10631 6.29501 7.90048 5 10.0001 5C11.2746 5 12.4342 5.48083 13.3171 6.26625L15.6742 3.90917C14.1859 2.52209 12.1951 1.66667 10.0001 1.66667C6.79923 1.66667 4.02339 3.47375 2.62756 6.12125Z" fill="#FF3D00"/>
                <path d="M10.0001 18.3333C12.1526 18.3333 14.1092 17.5096 15.5876 16.17L13.0084 13.9875C12.1434 14.6446 11.0801 15.0008 10.0001 15C7.83259 15 5.99092 13.6179 5.29759 11.6892L2.58008 13.7829C3.96092 16.4817 6.76175 18.3333 10.0001 18.3333Z" fill="#4CAF50"/>
                <path d="M18.1713 8.36792H17.5001V8.33334H10.0001V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0071 13.9879L13.0084 13.9871L15.5876 16.1696C15.4042 16.3363 18.3334 14.1667 18.3334 10C18.3334 9.44126 18.2759 8.89584 18.1713 8.36792Z" fill="#1976D2"/>
              </svg>
            </button>

            <button
              type="button"
              className="social-button facebook"
              onClick={() => handleSocialSignUp('facebook')}
              aria-label="Sign up with Facebook"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.95 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="#1877F2"/>
              </svg>
            </button>

            <button
              type="button"
              className="social-button apple"
              onClick={() => handleSocialSignUp('apple')}
              aria-label="Sign up with Apple"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.4287 17.0833C14.5703 17.9417 13.6287 17.8833 12.7287 17.4917C11.7703 17.0917 10.8953 17.075 9.8953 17.4917C8.62031 17.9917 7.95365 17.9167 7.19531 17.0833C2.32031 11.95 3.06198 4.15833 8.56198 3.9C9.85365 3.96667 10.7453 4.63333 11.4953 4.68333C12.637 4.45 13.737 3.75833 14.962 3.84167C16.437 3.95833 17.5453 4.55 18.262 5.625C15.4703 7.33333 16.162 11.1333 18.762 12.1667C18.2703 13.4833 17.6203 14.7917 15.4203 17.0917L15.4287 17.0833ZM11.3787 3.85C11.2203 2.01667 12.6453 0.483333 14.3453 0.333333C14.5953 2.46667 12.4953 4.1 11.3787 3.85Z" fill="black"/>
              </svg>
            </button>
          </div>

          <p className="login-link">
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </p>

          <p className="copyright">
            ©CARe 2026 ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  )
}
