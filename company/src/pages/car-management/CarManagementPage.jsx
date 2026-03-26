import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TabFilter from '../../components/TabFilter'
import CarService from '../../services/CarService'
import './CarManagementPage.css'

export default function CarManagementPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCompanyCars()
  }, [])

  const fetchCompanyCars = async () => {
    setLoading(true)
    setError(null)

    const companyId = localStorage.getItem('companyId')
    if (!companyId) {
      setError('회사 정보를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    const result = await CarService.getCompanyCars(companyId)

    if (result.success) {
      setCars(result.data || [])
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  // 상태 매핑 함수
  const getStatusText = (status) => {
    const statusMap = {
      ACTIVE: '대여가능',
      RENTED: '대여중',
      MAINTENANCE: '정비중',
      INACTIVE: '대여불가'
    }
    return statusMap[status] || status
  }

  // 연료 타입 매핑 함수
  const getFuelTypeText = (fuelType) => {
    const fuelMap = {
      GASOLINE: '가솔린',
      DIESEL: '디젤',
      ELECTRIC: '전기',
      HYBRID: '하이브리드'
    }
    return fuelMap[fuelType] || fuelType
  }

  // 상태별 카테고리 매핑
  const getCategoryFromStatus = (status) => {
    const categoryMap = {
      ACTIVE: 'available',
      RENTED: 'rented',
      MAINTENANCE: 'maintenance',
      INACTIVE: 'inactive'
    }
    return categoryMap[status] || 'all'
  }

  // 탭 카운트 계산
  const getTabCounts = () => {
    const counts = {
      all: cars.length,
      available: cars.filter(car => car.status === 'ACTIVE').length,
      rented: cars.filter(car => car.status === 'RENTED').length,
      maintenance: cars.filter(car => car.status === 'MAINTENANCE').length
    }
    return counts
  }

  const tabCounts = getTabCounts()

  const tabs = [
    { id: 'all', label: '총', count: tabCounts.all },
    { id: 'available', label: '대여가능', count: tabCounts.available },
    { id: 'rented', label: '대여중', count: tabCounts.rented },
    { id: 'maintenance', label: '정비중', count: tabCounts.maintenance },
  ]

  const handleItemClick = (carId) => {
    navigate(`/cars/${carId}`)
  }

  const filteredCars =
    activeTab === 'all'
      ? cars
      : cars.filter((car) => getCategoryFromStatus(car.status) === activeTab)

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: 'badge-blue',
      RENTED: 'badge-green',
      MAINTENANCE: 'badge-amber',
      INACTIVE: 'badge-gray'
    }
    return statusMap[status] || 'badge-gray'
  }

  if (loading) {
    return (
      <div className="car-management-page">
        <div className="page-header-with-button">
          <div>
            <h1 className="page-title">차량 관리</h1>
            <p className="page-subtitle">등록된 차량을 관리하고 새로운 차량을 등록하세요</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="car-management-page">
        <div className="page-header-with-button">
          <div>
            <h1 className="page-title">차량 관리</h1>
            <p className="page-subtitle">등록된 차량을 관리하고 새로운 차량을 등록하세요</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="car-management-page">
      <div className="page-header-with-button">
        <div>
          <h1 className="page-title">차량 관리</h1>
          <p className="page-subtitle">등록된 차량을 관리하고 새로운 차량을 등록하세요</p>
        </div>
        <button className="btn btn-primary"
          onClick={() => navigate('/cars/register')}>+ 차량 등록</button>
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
            {filteredCars.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>
                  등록된 차량이 없습니다.
                </td>
              </tr>
            ) : (
              filteredCars.map((car) => (
                <tr key={car.carId}
                  onClick={() => handleItemClick(car.carId)}
                >
                  <td>
                    <div className="cell-with-icon">
                      <div className="cell-content">
                        <div className="cell-primary">{car.brand} {car.modelName}</div>
                        <div className="cell-secondary">
                          {getFuelTypeText(car.fuelType)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-text">-</div>
                  </td>
                  <td>
                    <div className="cell-text">-</div>
                  </td>
                  <td>
                    <div className="cell-amount">-</div>
                  </td>
                  <td>
                    <div className="cell-text">-</div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(car.status)}`}>
                      {getStatusText(car.status)}
                    </span>
                  </td>
                  <td>
                    <button className="menu-button">⋮</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
