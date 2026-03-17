import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { id: 'dashboard', label: '대시보드', path: '/dashboard' },
    { id: 'cars', label: '차량 관리', path: '/cars' },
    { id: 'reservations', label: '예약 관리', path: '/reservations' },
    { id: 'profile', label: '내 정보', path: '/profile' },
  ]

  const bottomItems = [
    { id: 'settings', icon: '⚙️', label: '설정', path: '/settings' },
    { id: 'logout', icon: '🚪', label: '로그아웃', path: '/logout' },
  ]

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
              className="sidebar-item"
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}

          <div className="sidebar-company-info">
            <div className="company-name">강남 렌터카</div>
            <div className="company-email">business@care.com</div>
          </div>
        </div>
      </nav>
    </aside>
  )
}
