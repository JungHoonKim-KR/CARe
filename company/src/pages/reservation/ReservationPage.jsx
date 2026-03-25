import React, { useEffect, useState } from 'react'
import TabFilter from '../../components/TabFilter'
import ReservationTable from '../../components/ReservationTable'
import ReservationService from '../../services/ReservationService'
import './ReservationPage.css'

export default function ReservationPage() {
  const [activeTab, setActiveTab] = useState('ongoing')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReservations()
  }, [])

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
      RESERVED: '예약완료',
      IN_USE: '이용중',
      AFTER_SCAN: '반납대기',
      COMPLETED: '반납완료',
      DISPUTE: '분쟁중'
    }
    return statusMap[status] || status
  }

  const getCategoryFromStatus = (status) => {
    if (status === 'DISPUTE') return 'dispute'
    if (status === 'COMPLETED') return 'completed'
    return 'ongoing'
  }

  const fetchReservations = async () => {
    setLoading(true)
    setError('')

    const result = await ReservationService.getReservations()
    if (!result.success) {
      setError(result.message)
      setLoading(false)
      return
    }

    const formatted = (result.data || []).map((reservation) => ({
      id: reservation.reservationId,
      carName: `${reservation.brand || '-'} ${reservation.modelName || ''}`.trim(),
      carType: reservation.plateNumber || '-',
      renterName: '-',
      renterCountry: reservation.insuranceName || '-',
      startDate: formatDate(reservation.pickupDate),
      endDate: formatDate(reservation.returnDate),
      location: '-',
      amount: '-',
      status: getStatusLabel(reservation.status),
      category: getCategoryFromStatus(reservation.status)
    }))

    setReservations(formatted)
    setLoading(false)
  }

  const filteredReservations = reservations.filter(
    (reservation) => reservation.category === activeTab
  )

  const tabs = [
    { id: 'ongoing', label: '진행중', count: reservations.filter((r) => r.category === 'ongoing').length },
    { id: 'completed', label: '완료', count: reservations.filter((r) => r.category === 'completed').length },
    { id: 'dispute', label: '분쟁', count: reservations.filter((r) => r.category === 'dispute').length },
  ]

  return (
    <div className="reservation-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">예약 관리</h1>
          <p className="page-subtitle">예약 현황을 확인하고 관리하세요</p>
        </div> 
      </div>

      <TabFilter tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && (
        <div className="empty-container">
          <p>예약 목록을 불러오는 중...</p>
        </div>
      )}

      {error && !loading && (
        <div className="empty-container">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredReservations.length === 0 && (
        <div className="empty-container">
          <p>예약 내역이 없습니다.</p>
        </div>
      )}

      {!loading && !error && filteredReservations.length > 0 && (
        <ReservationTable reservations={filteredReservations} />
      )}
    </div>
  )
}
