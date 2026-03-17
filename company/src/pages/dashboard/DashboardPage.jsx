import React from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import ReservationList from '../../components/ReservationList'
import './DashboardPage.css'

export default function DashboardPage() {
  const stats = [
    {
      title: '총 수익',
      value: '12,500,000원',
      subtitle: '전체 누적 수익',
      icon: '📈',
      trend: null,
    },
    {
      title: '정산 대기',
      value: '850,000원',
      subtitle: '처리 대기 중',
      icon: '📄',
      trend: null,
    },
    {
      title: '운영 현황',
      value: '8대',
      subtitle: '완료 예약 45건',
      icon: '🚗',
      trend: null,
    },
  ]

  const recentReservations = [
    {
      id: 1,
      carName: '현대 아반떼',
      customerName: '김철수',
      date: '2026.03.05',
      amount: '150,000원',
      status: '이용중',
    },
    {
      id: 2,
      carName: '기아 K5',
      customerName: '이영희',
      date: '2026.03.07',
      amount: '180,000원',
      status: '예약완료',
    },
    {
      id: 3,
      carName: 'BMW 320i',
      customerName: '박민수',
      date: '2026.03.04',
      amount: '360,000원',
      status: '반납완료',
    },
    {
      id: 4,
      carName: '현대 싼타페',
      customerName: '최지은',
      date: '2026.02.28',
      amount: '240,000원',
      status: '분쟁중',
    },
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">대시보드</h1>
          <p className="page-subtitle">수익 현황과 예약 관리를 한눈에 확인하세요</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="section-container card">
        <div className="section-header">
          <h2 className="section-title">최근 예약</h2>
          <Link to="/reservations" className="section-link">
            전체보기 →
          </Link>
        </div>

        <ReservationList reservations={recentReservations} />
      </div>
    </div>
  )
}
