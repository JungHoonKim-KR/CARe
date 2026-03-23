import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/login/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ReservationPage from './pages/reservation/ReservationPage'
import ReservationDetailPage from './pages/reservation-detail/ReservationDetailPage'
import AIReportPage from './pages/ai-report/AIReportPage'
import CarManagementPage from './pages/car-management/CarManagementPage'
import CarDetailPage from './pages/car-detail/CarDetailPage'
import CarRegisterPage from './pages/car-register/CarRegisterPage'
<<<<<<< HEAD
import DisputesList from './pages/dispute/DisputesList'
import DisputePage from './pages/dispute/DisputePage'
=======
import ProtectedRoute from './components/ProtectedRoute'
import AuthService from './services/AuthService'
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
import './App.css'

export default function App() {
  const isAuthenticated = AuthService.isAuthenticated()

  return (
    <Routes>
      {/* 🔥 기본 루트 분기 */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* 공개 페이지 */}
      <Route path="/login" element={<LoginPage />} />

<<<<<<< HEAD
      {/* Main App Routes - With Sidebar */}
      <Route
        path="*"
        element={
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cars" element={<CarManagementPage />} />
                <Route path="/cars/register" element={<CarRegisterPage />} />
                <Route path="/cars/:id" element={<CarDetailPage />} />
                <Route path="/reservations" element={<ReservationPage />} />
                <Route path="/reservations/:id" element={<ReservationDetailPage />} />
                <Route path="/ai-report/:id" element={<AIReportPage />} />
                <Route path="/disputes" element={<DisputesList />} />
                <Route path="/disputes/:id" element={<DisputePage />} />
                <Route path="/profile" element={<div className="placeholder-page">내 정보 페이지</div>} />
                <Route path="/settings" element={<div className="placeholder-page">설정 페이지</div>} />
                <Route path="/logout" element={<div className="placeholder-page">로그아웃</div>} />
              </Routes>
            </main>
          </div>
=======
      {/* 보호된 영역 */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/cars" element={<CarManagementPage />} />
                  <Route path="/cars/:id" element={<CarDetailPage />} />
                  <Route path="/cars/register" element={<CarRegisterPage />} />
                  <Route path="/reservations" element={<ReservationPage />} />
                  <Route path="/reservations/:id" element={<ReservationDetailPage />} />
                  <Route path="/ai-report/:id" element={<AIReportPage />} />
                  <Route path="/profile" element={<div className="placeholder-page">내 정보 페이지</div>} />
                  <Route path="/settings" element={<div className="placeholder-page">설정 페이지</div>} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
>>>>>>> cea883334bf5911fc6abf465d7e817cdae7d5ab5
        }
      />
    </Routes>
  )
}