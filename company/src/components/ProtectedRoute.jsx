import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const isLogin = !!localStorage.getItem('token')

  if (!isLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}