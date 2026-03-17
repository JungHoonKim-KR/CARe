import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/dashboard/DashboardPage'
import ReservationPage from './pages/reservation/ReservationPage'
import './App.css'

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* 추가 라우트는 여기에 */}
          <Route path="/cars" element={<div className="placeholder-page">차량 관리 페이지</div>} />
          <Route path="/reservations" element={<ReservationPage />} />
          <Route path="/profile" element={<div className="placeholder-page">내 정보 페이지</div>} />
          <Route path="/settings" element={<div className="placeholder-page">설정 페이지</div>} />
          <Route path="/logout" element={<div className="placeholder-page">로그아웃</div>} />
        </Routes>
      </main>
    </div>
  )
}