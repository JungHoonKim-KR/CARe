import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TabFilter from '../../components/TabFilter'
import './CarManagementPage.css'

export default function CarManagementPage() {
  const [activeTab, setActiveTab] = useState('all')
  const navigate = useNavigate()

  const tabs = [
    { id: 'all', label: '총', count: 4 },
    { id: 'available', label: '대여가능', count: 2 },
    { id: 'rented', label: '대여중', count: 1 },
    { id: 'maintenance', label: '정비중', count: 1 },
  ]

  const handleItemClick = (carId) => {
    navigate(`/cars/${carId}`)
  }

  const allCars = [
    {
      id: 1,
      name: '현대 아반떼',
      year: '2024년식',
      options: '가솔린',
      type: '세단 · 5인승',
      location: '서울 강남구',
      dailyRate: '50,000원',
      reservations: 12,
      status: '대여가능',
      category: 'available',
    },
    {
      id: 2,
      name: '기아 K5',
      year: '2023년식',
      options: '하이브리드',
      type: '세단 · 5인승',
      location: '서울 송파구',
      dailyRate: '60,000원',
      reservations: 8,
      status: '대여중',
      category: 'rented',
    },
    {
      id: 3,
      name: 'BMW 320i',
      year: '2024년식',
      options: '가솔린',
      type: '세단 · 5인승',
      location: '서울 서초구',
      dailyRate: '120,000원',
      reservations: 15,
      status: '대여가능',
      category: 'available',
    },
    {
      id: 4,
      name: '현대 싼타페',
      year: '2024년식',
      options: '디젤',
      type: 'SUV · 7인승',
      location: '서울 강남구',
      dailyRate: '80,000원',
      reservations: 10,
      status: '정비중',
      category: 'maintenance',
    },
  ]

  const filteredCars =
    activeTab === 'all' ? allCars : allCars.filter((car) => car.category === activeTab)

  const getStatusBadge = (status) => {
    const statusMap = {
      대여가능: 'badge-blue',
      대여중: 'badge-green',
      정비중: 'badge-amber',
    }
    return statusMap[status] || 'badge-gray'
  }

  return (
    <div className="car-management-page">
      <div className="page-header-with-button">
        <div>
          <h1 className="page-title">차량 관리</h1>
          <p className="page-subtitle">등록된 차량을 관리하고 새로운 차량을 등록하세요</p>
        </div>
        <button className="btn btn-primary">+ 차량 등록</button>
      </div>

      <TabFilter tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="car-table-container">
        <table className="car-table">
          <thead>
            <tr>
              <th>차량</th>
              <th>차종</th>
              <th>위치</th>
              <th>일일 대여료</th>
              <th>예약 수</th>
              <th>상태</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.map((car) => (
              <tr key={car.id}
                onClick={() => handleItemClick(car.id)}
              >
                <td>
                  <div className="cell-with-icon">
                    <div className="cell-content">
                      <div className="cell-primary">{car.name}</div>
                      <div className="cell-secondary">
                        {car.year} · {car.options}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cell-text">{car.type}</div>
                </td>
                <td>
                  <div className="cell-text">{car.location}</div>
                </td>
                <td>
                  <div className="cell-amount">{car.dailyRate}</div>
                </td>
                <td>
                  <div className="cell-text">{car.reservations}건</div>
                </td>
                <td>
                  <span className={`badge ${getStatusBadge(car.status)}`}>{car.status}</span>
                </td>
                <td>
                  <button className="menu-button">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
