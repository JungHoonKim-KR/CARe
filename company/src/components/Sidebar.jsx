import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'
import './Sidebar.css'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: '대시보드', path: '/dashboard' },
    { id: 'cars', label: '차량 관리', path: '/cars' },
    { id: 'reservations', label: '예약 관리', path: '/reservations' },
    { id: 'disputes', label: '분쟁 관리', path: '/disputes' },
    { id: 'profile', label: '내 정보', path: '/profile' }
  ]

  const bottomItems = [
    { id: 'settings', label: '설정', path: '/settings' }
  ]

  const handleLogout = async () => {
    const confirmed = window.confirm('로그아웃하시겠습니까?')
    if (!confirmed) return

    await AuthService.logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-text">CARe 업체</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-bottom">
          {bottomItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}

          <button
            type="button"
            className="sidebar-item sidebar-logout-button"
            onClick={handleLogout}
          >
            <span className="sidebar-icon"></span>
            <span className="sidebar-label">로그아웃</span>
          </button>

          <div className="sidebar-company-info">
            <div className="company-name">강남 렌터카</div>
            <div className="company-email">business@care.com</div>
          </div>
        </div>
      </nav>
    </aside>
  )
}