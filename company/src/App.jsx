import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ReservationPage from './pages/reservation/ReservationPage'
import './App.css'

export default function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/reservations" replace />} />
          <Route path="/reservations" element={<ReservationPage />} />
        </Routes>
      </main>
    </div>
  )
}
