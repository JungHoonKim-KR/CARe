import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/login/LoginPage'
import SignUpPage from './pages/signup/SignUpPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ReservationPage from './pages/reservation/ReservationPage'
import ReservationDetailPage from './pages/reservation-detail/ReservationDetailPage'
import AIReportPage from './pages/ai-report/AIReportPage'
import CarManagementPage from './pages/car-management/CarManagementPage'
import CarDetailPage from './pages/car-detail/CarDetailPage'
import CarRegisterPage from './pages/car-register/CarRegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignUpPage />} />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
        }
      />
    </Routes>
  )
}