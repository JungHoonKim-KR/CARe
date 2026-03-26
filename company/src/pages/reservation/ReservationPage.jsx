import React, { useEffect, useState } from 'react'
import TabFilter from '../../components/TabFilter'
import ReservationTable from '../../components/ReservationTable'
import ReservationService from '../../services/ReservationService'
import './ReservationPage.css'

// 💡 데이터가 없을 때 보여줄 목업 데이터
const MOCK_RESERVATIONS = [
  { id: 'RES-2603-01', carName: 'Tesla Model 3', carType: '123가 4567', renterName: '김현우', renterCountry: '삼성화재', startDate: '2026.03.26 10:00', endDate: '2026.03.28 10:00', location: '서울 강남구', amount: '150,000원', status: '이용중', category: 'ongoing' },
  { id: 'RES-2603-02', carName: 'Hyundai Ioniq 5', carType: '890나 1234', renterName: '이서연', renterCountry: '현대해상', startDate: '2026.03.25 14:00', endDate: '2026.03.27 14:00', location: '부산 해운대구', amount: '120,000원', status: '반납대기', category: 'ongoing' },
  { id: 'RES-2603-03', carName: 'Kia EV6', carType: '456다 7890', renterName: '박지훈', renterCountry: 'KB손해보험', startDate: '2026.03.20 09:00', endDate: '2026.03.22 09:00', location: '제주 국제공항', amount: '200,000원', status: '반납완료', category: 'completed' },
  { id: 'RES-2603-04', carName: 'Genesis GV60', carType: '111라 2222', renterName: '최유진', renterCountry: 'DB손해보험', startDate: '2026.03.27 11:00', endDate: '2026.03.30 11:00', location: '인천 연수구', amount: '180,000원', status: '예약완료', category: 'ongoing' },
  { id: 'RES-2603-05', carName: 'Polestar 2', carType: '333마 4444', renterName: '정민수', renterCountry: '메리츠화재', startDate: '2026.03.26 15:00', endDate: '2026.03.29 15:00', location: '서울 서초구', amount: '165,000원', status: '분쟁중', category: 'dispute' },
]

export default function ReservationPage() {
  const [activeTab, setActiveTab] = useState('ongoing')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

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
    try {
      const result = await ReservationService.getReservations()

      // 데이터가 아예 없거나 실패했을 경우 목업 데이터 사용
      if (!result.success || !result.data || result.data.length === 0) {
        setReservations(MOCK_RESERVATIONS)
      } else {
        const formatted = result.data.map((reservation) => ({
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
        setReservations(formatted.length > 0 ? formatted : MOCK_RESERVATIONS)
      }
    } catch (err) {
      // API 에러 시에도 빈 화면 대신 목업 제공
      setReservations(MOCK_RESERVATIONS)
    } finally {
      setLoading(false)
    }
  }

  // 통계 계산
  const stats = {
    total: reservations.length,
    ongoing: reservations.filter((r) => r.category === 'ongoing').length,
    completed: reservations.filter((r) => r.category === 'completed').length,
    dispute: reservations.filter((r) => r.category === 'dispute').length,
  }

  const filteredReservations = reservations.filter(
    (reservation) => reservation.category === activeTab
  )

  const tabs = [
    { id: 'ongoing', label: '진행중', count: stats.ongoing },
    { id: 'completed', label: '완료', count: stats.completed },
    { id: 'dispute', label: '분쟁', count: stats.dispute },
  ]

  return (
    <div className="reservation-page">
      {/* 1. 타이틀 카드 (대시보드 스타일) */}
      <div className="res-welcome-card">
        <div className="res-welcome-text">
          <h1 className="res-title">예약 관리 및 현황</h1>
          <p className="res-subtitle">현재 진행 중인 모든 예약과 반납 현황을 한눈에 확인하세요.</p>
        </div>
      </div>

      {/* 2. KPI 요약 카드 그리드 */}
      <div className="res-kpi-grid">
        <div className="res-kpi-card" data-delay="0">
          <div className="res-kpi-icon" style={{ '--ka': '#4A90E2' }}>📊</div>
          <div>
            <div className="res-kpi-label">전체 예약</div>
            <div className="res-kpi-value">{stats.total}<span className="res-kpi-unit">건</span></div>
          </div>
        </div>
        <div className="res-kpi-card" data-delay="1">
          <div className="res-kpi-icon" style={{ '--ka': '#F5A623' }}>🚗</div>
          <div>
            <div className="res-kpi-label">진행중</div>
            <div className="res-kpi-value">{stats.ongoing}<span className="res-kpi-unit">건</span></div>
          </div>
        </div>
        <div className="res-kpi-card" data-delay="2">
          <div className="res-kpi-icon" style={{ '--ka': '#7ED321' }}>✅</div>
          <div>
            <div className="res-kpi-label">완료됨</div>
            <div className="res-kpi-value">{stats.completed}<span className="res-kpi-unit">건</span></div>
          </div>
        </div>
        <div className="res-kpi-card" data-delay="3">
          <div className="res-kpi-icon" style={{ '--ka': '#D0021B' }}>⚠️</div>
          <div>
            <div className="res-kpi-label">분쟁/이슈</div>
            <div className="res-kpi-value">{stats.dispute}<span className="res-kpi-unit">건</span></div>
          </div>
        </div>
      </div>

      {/* 3. 메인 콘텐츠 (테이블 영역) */}
      <div className="res-content-card">
        <TabFilter tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {loading ? (
          <div className="empty-container">
            <div className="loading-spinner"></div>
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="res-table-wrapper">
            <ReservationTable reservations={filteredReservations} />
          </div>
        )}
      </div>
    </div>
  )
}