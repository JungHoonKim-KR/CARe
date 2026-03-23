import React from 'react'
import { Navigate } from 'react-router-dom'
import AuthService from '../services/AuthService'

export default function ProtectedRoute({ children }) {
  const isLogin = AuthService.isAuthenticated()

  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}