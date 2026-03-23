import React, { useState, useEffect } from 'react'
import TabFilter from '../../components/TabFilter'
import ReservationTable from '../../components/ReservationTable'
import ReservationService from '../../services/ReservationService'
import AuthService from '../../services/AuthService'
import './ReservationPage.css'

export default function ReservationPage() {
  const [activeTab, setActiveTab] = useState('ongoing')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const tabs = [
    { id: 'ongoing', label: '진행중', count: 0 },
    { id: 'completed', label: '완료', count: 0 },
    { id: 'dispute', label: '분쟁', count: 0 },
  ]

  useEffect(() => {
    fetchReservations()
  }, [activeTab])

  const fetchReservations = async () => {
    setLoading(true)
    setError('')

    const companyId = AuthService.getCompanyId()
    if (!companyId) {
      setError('회사 정보를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    try {
      // activeTab에 따른 status 매핑
      let statusFilter = null
      if (activeTab === 'ongoing') {
        statusFilter = 'CONFIRMED' // 또는 'IN_PROGRESS', API 스펙에 따라 조정
      } else if (activeTab === 'completed') {
        statusFilter = 'COMPLETED'
      } else if (activeTab === 'dispute') {
        statusFilter = 'DISPUTE'
      }

      const result = await ReservationService.getReservations(companyId, {
        status: statusFilter,
        page: 0,
        size: 100
      })

      if (result.success) {
        // API 응답 데이터를 UI 형식으로 변환
        // 페이지네이션 응답인 경우 content 필드 사용
        const reservationData = Array.isArray(result.data)
          ? result.data
          : (result.data.content || [])

        const formattedReservations = reservationData.map(reservation => ({
          id: reservation.reservationId,
          carName: `${reservation.car.brand} ${reservation.car.modelName}`,
          carType: reservation.car.plateNumber,
          renterName: reservation.renter.name,
          renterCountry: reservation.renter.email,
          startDate: formatDate(reservation.pickupDate),
          endDate: formatDate(reservation.returnDate),
          location: '-', // API에서 제공하지 않는 경우
          amount: reservation.insurance ? `${reservation.insurance.price.toLocaleString()}원` : '-',
          status: getStatusLabel(reservation.status),
          category: getCategoryFromStatus(reservation.status)
        }))

        setReservations(formattedReservations)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('예약 조회 에러:', err)
      setError('예약 목록을 불러오는데 실패했습니다.')
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
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}.${month}.${day} ${hours}:${minutes}`
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

  const getCategoryFromStatus = (status) => {
    if (['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(status)) {
      return 'ongoing'
    } else if (status === 'COMPLETED') {
      return 'completed'
    } else if (status === 'DISPUTE') {
      return 'dispute'
    }
    return 'ongoing'
  }

  const filteredReservations = reservations.filter(
    (reservation) => reservation.category === activeTab
  )

  // 탭별 카운트 업데이트
  const updatedTabs = tabs.map(tab => ({
    ...tab,
    count: reservations.filter(r => r.category === tab.id).length
  }))

  return (
    <div className="reservation-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">예약 관리</h1>
          <p className="page-subtitle">예약 현황을 확인하고 관리하세요</p>
        </div>
      </div>

      <TabFilter tabs={updatedTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && (
        <div className="loading-container">
          <p>예약 목록을 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <ReservationTable reservations={filteredReservations} />
      )}

      {!loading && !error && filteredReservations.length === 0 && (
        <div className="empty-container">
          <p>예약 내역이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
