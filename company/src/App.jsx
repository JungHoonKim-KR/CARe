import React from 'react' // build trigger
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/login/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ReservationPage from './pages/reservation/ReservationPage'
import ReservationDetailPage from './pages/reservation-detail/ReservationDetailPage'
import AIReportPage from './pages/ai-report/AIReportPage'
import CarManagementPage from './pages/car-management/CarManagementPage'
import CarDetailPage from './pages/car-detail/CarDetailPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      {/* Login Route - No Sidebar */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main App Routes - With Sidebar */}
      <Route path="*" element={
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cars" element={<CarManagementPage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />
              <Route path="/reservations" element={<ReservationPage />} />
              <Route path="/reservations/:id" element={<ReservationDetailPage />} />
              <Route path="/ai-report/:id" element={<AIReportPage />} />
              {/* 추가 라우트는 여기에 */}
              <Route path="/profile" element={<div className="placeholder-page">내 정보 페이지</div>} />
              <Route path="/settings" element={<div className="placeholder-page">설정 페이지</div>} />
              <Route path="/logout" element={<div className="placeholder-page">로그아웃</div>} />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  )
}