import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'
import CompanyNotificationService from '../services/CompanyNotificationService'
import './Sidebar.css'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [company, setCompany] = useState({
    name: localStorage.getItem('companyName') || '',
    email: localStorage.getItem('companyEmail') || ''
  })

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      setCompany({
        name: localStorage.getItem('companyName') || '',
        email: localStorage.getItem('companyEmail') || ''
      })
    }

    // storage 이벤트 리스너 (다른 탭에서 변경 시)
    window.addEventListener('storage', handleStorageChange)

    // 주기적으로 확인 (같은 탭에서 변경 시)
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const menuItems = [
    { id: 'dashboard', label: '대시보드', path: '/dashboard' },
    { id: 'cars', label: '차량 관리', path: '/cars' },
    { id: 'reservations', label: '예약 관리', path: '/reservations' },
    { id: 'disputes', label: '분쟁 관리', path: '/disputes' },
  ]

  useEffect(() => {
    let mounted = true

    const loadNotifications = async () => {
      const result = await CompanyNotificationService.getNotifications()
      if (!mounted) return

      if (result.success) {
        setNotifications(result.data)
      } else {
        console.warn('알림 목록 로드 실패:', result.message)
        setNotifications([])
      }
    }

    loadNotifications()

    const token = localStorage.getItem('token')
    if (!token) {
      return () => {
        mounted = false
      }
    }

    const abortController = new AbortController()
    CompanyNotificationService.subscribeNotifications({
      token,
      signal: abortController.signal,
      onNotification: (notification) => {
        setNotifications((prev) => [notification, ...prev])
      },
      onError: (error) => {
        console.error('업체 알림 SSE 연결 오류:', error)
      },
    }).catch((error) => {
      if (abortController.signal.aborted) return
      console.error('업체 알림 SSE 구독 실패:', error)
    })

    return () => {
      mounted = false
      abortController.abort()
    }
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const handleNotificationClick = async (notification) => {
    if (!notification.read && notification.notificationId) {
      const result = await CompanyNotificationService.markAsRead(notification.notificationId)
      if (result.success) {
        setNotifications((prev) => prev.map((item) => (
          item.notificationId === notification.notificationId
            ? { ...item, read: true, readAt: result.data?.readAt || item.readAt }
            : item
        )))
      }
    }

    if (notification.disputeId) {
      navigate(`/disputes/${notification.disputeId}`)
      setNotificationOpen(false)
    }
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('로그아웃하시겠습니까?')
    if (!confirmed) return

    await AuthService.logout()
    navigate('/company/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-row">
          <div className="sidebar-logo">
            <span className="logo-text">CARe 업체</span>
          </div>
          <div className="sidebar-notification-wrap">
            <button
              type="button"
              className="sidebar-notification-btn"
              onClick={() => setNotificationOpen((prev) => !prev)}
              aria-label="알림"
            >
              알림
              {unreadCount > 0 && <span className="sidebar-notification-badge">{unreadCount}</span>}
            </button>
            {notificationOpen && (
              <div className="sidebar-notification-panel">
                <div className="sidebar-notification-title">실시간 알림</div>
                <div className="sidebar-notification-list">
                  {notifications.length === 0 && (
                    <div className="sidebar-notification-empty">새 알림이 없습니다.</div>
                  )}
                  {notifications.slice(0, 10).map((notification) => (
                    <button
                      key={notification.notificationId}
                      type="button"
                      className={`sidebar-notification-item ${notification.read ? '' : 'unread'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="sidebar-notification-item-title">{notification.title}</div>
                      <div className="sidebar-notification-item-message">{notification.message}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
          <div className="sidebar-company-info">
            <div className="sidebar-company-top">
              <div className="company-name">
                {company.name || '회사명 없음'}
              </div>

              <button
                type="button"
                className="sidebar-inline-logout-btn"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>

            <div className="company-email">
              {company.email || ''}
            </div>
          </div>
        </div>

      </nav>
    </aside>
  )
}