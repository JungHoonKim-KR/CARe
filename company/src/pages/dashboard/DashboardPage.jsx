import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import ReservationList from '../../components/ReservationList'
import ReservationService from '../../services/ReservationService'
import AuthService from '../../services/AuthService'
import './DashboardPage.css'

export default function DashboardPage() {
  const [recentReservations, setRecentReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const stats = [
    {
      title: '총 수익',
      value: '12,500,000원',
      subtitle: '전체 누적 수익',
      trend: null,
    },
    {
      title: '정산 대기',
      value: '850,000원',
      subtitle: '처리 대기 중',
      trend: null,
    },
    {
      title: '운영 현황',
      value: '8대',
      subtitle: '완료 예약 45건',
      trend: null,
    },
  ]

  useEffect(() => {
    fetchRecentReservations()
  }, [])

  const fetchRecentReservations = async () => {
    const companyId = AuthService.getCompanyId()
    if (!companyId) {
      setLoading(false)
      return
    }

    try {
      const result = await ReservationService.getReservations(companyId, {
        page: 0,
        size: 5 // 최근 5개만
      })

      if (result.success) {
        // API 응답 데이터를 UI 형식으로 변환
        // 페이지네이션 응답인 경우 content 필드 사용
        const reservationData = Array.isArray(result.data)
          ? result.data
          : (result.data.content || [])

        const formattedReservations = reservationData.slice(0, 4).map(reservation => ({
          id: reservation.reservationId,
          carName: `${reservation.car.brand} ${reservation.car.modelName}`,
          customerName: reservation.renter.name,
          date: formatDate(reservation.pickupDate),
          amount: reservation.insurance ? `${reservation.insurance.price.toLocaleString()}원` : '-',
          status: getStatusLabel(reservation.status)
        }))

        setRecentReservations(formattedReservations)
      }
    } catch (err) {
      console.error('최근 예약 조회 에러:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return '-'
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': '예약대기',
      'CONFIRMED': '예약완료',
      'IN_PROGRESS': '이용중',
      'COMPLETED': '반납완료',
      'DISPUTE': '분쟁중',
      'CANCELLED': '취소됨'
    }
    return statusMap[status] || status
  }

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

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>예약 목록을 불러오는 중...</p>
          </div>
        ) : recentReservations.length > 0 ? (
          <ReservationList reservations={recentReservations} />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>최근 예약이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
