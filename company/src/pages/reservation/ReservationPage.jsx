import React, { useState } from 'react'
import TabFilter from '../../components/TabFilter'
import ReservationTable from '../../components/ReservationTable'
import './ReservationPage.css'

export default function ReservationPage() {
  const [activeTab, setActiveTab] = useState('ongoing')

  const tabs = [
    { id: 'ongoing', label: '진행중', count: 2 },
    { id: 'completed', label: '완료', count: 1 },
    { id: 'dispute', label: '분쟁', count: 1 },
  ]


  // 백엔드 연동 시
  // const [reservations, setReservations] = useState([])
  // useEffect(() => {
  //   fetchAllReservations()
  // }, [activeTab])


  const allReservations = [
    {
      id: 1,
      carName: '현대 아반떼',
      carType: '세단',
      renterName: '김철수',
      renterCountry: '010',
      startDate: '2026.03.05 10:00',
      endDate: '2026.03.08 18:00',
      location: '서울 강남구',
      amount: '150,000원',
      status: '이용중',
      category: 'ongoing',
    },
    {
      id: 2,
      carName: '기아 K5',
      carType: '세단',
      renterName: '이영희',
      renterCountry: '미국',
      startDate: '2026.03.07 14:00',
      endDate: '2026.03.10 14:00',
      location: '서울 송파구',
      amount: '180,000원',
      status: '예약완료',
      category: 'ongoing',
    },
    {
      id: 3,
      carName: 'BMW 320i',
      carType: 'SUV',
      renterName: '박민수',
      renterCountry: '일본',
      startDate: '2026.03.01 09:00',
      endDate: '2026.03.04 18:00',
      location: '서울 강남구',
      amount: '360,000원',
      status: '반납완료',
      category: 'completed',
    },
    {
      id: 4,
      carName: '현대 싼타페',
      carType: 'SUV',
      renterName: '최지은',
      renterCountry: '중국',
      startDate: '2026.02.25 10:00',
      endDate: '2026.02.28 15:00',
      location: '서울 서초구',
      amount: '240,000원',
      status: '분쟁중',
      category: 'dispute',
    },
  ]

  const filteredReservations = allReservations.filter(
    (reservation) => reservation.category === activeTab
  )

  return (
    <div className="reservation-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">예약 관리</h1>
          <p className="page-subtitle">예약 현황을 확인하고 관리하세요</p>
        </div> 
      </div>

      <TabFilter tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <ReservationTable reservations={filteredReservations} />
    </div>
  )
}
