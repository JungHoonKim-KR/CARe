import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TabFilter from '../../components/TabFilter'
import CarService from '../../services/CarService'
import AuthService from '../../services/AuthService'
import './CarManagementPage.css'

export default function CarManagementPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    setLoading(true)
    setError('')

    const companyId = AuthService.getCompanyId()
    if (!companyId) {
      setError('회사 정보를 찾을 수 없습니다.')
      setLoading(false)
      return
    }

    try {
      const result = await CarService.getCars(companyId)

      if (result.success) {
        // API 응답 데이터를 UI 형식으로 변환
        const formattedCars = result.data.map(car => ({
          id: car.carId,
          name: `${car.brand} ${car.modelName}`,
          year: '-', // API에서 제공하지 않음
          options: car.fuelType,
          type: '-', // API에서 제공하지 않음
          location: '-', // API에서 제공하지 않음
          dailyRate: '-', // API에서 제공하지 않음
          reservations: 0, // API에서 제공하지 않음
          status: getStatusLabel(car.status),
          category: getCategoryFromStatus(car.status),
          plateNumber: car.plateNumber,
          frontImage: car.frontImageUrl
        }))

        setCars(formattedCars)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('차량 목록 조회 에러:', err)
      setError('차량 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'AVAILABLE': '대여가능',
      'RENTED': '대여중',
      'MAINTENANCE': '정비중',
      'UNAVAILABLE': '사용불가'
    }
    return statusMap[status] || status
  }

  const getCategoryFromStatus = (status) => {
    const categoryMap = {
      'AVAILABLE': 'available',
      'RENTED': 'rented',
      'MAINTENANCE': 'maintenance',
      'UNAVAILABLE': 'maintenance'
    }
    return categoryMap[status] || 'available'
  }

  const filteredCars = activeTab === 'all'
    ? cars
    : cars.filter((car) => car.category === activeTab)

  // 탭별 카운트 업데이트
  const tabs = [
    { id: 'all', label: '총', count: cars.length },
    { id: 'available', label: '대여가능', count: cars.filter(c => c.category === 'available').length },
    { id: 'rented', label: '대여중', count: cars.filter(c => c.category === 'rented').length },
    { id: 'maintenance', label: '정비중', count: cars.filter(c => c.category === 'maintenance').length },
  ]

  const handleItemClick = (carId) => {
    navigate(`/cars/${carId}`)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      '대여가능': 'badge-blue',
      '대여중': 'badge-green',
      '정비중': 'badge-amber',
      '사용불가': 'badge-gray'
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
        <button className="btn btn-primary"
          onClick={() => navigate('/cars/register')}>+ 차량 등록</button>
      </div>

      <TabFilter tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && (
        <div className="loading-container">
          <p>차량 목록을 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="car-table-container">
          <table className="car-table">
            <thead>
              <tr>
                <th>차량</th>
                <th>차량번호</th>
                <th>연료</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.length > 0 ? (
                filteredCars.map((car) => (
                  <tr key={car.id}
                    onClick={() => handleItemClick(car.id)}
                  >
                    <td>
                      <div className="cell-with-icon">
                        <div className="cell-content">
                          <div className="cell-primary">{car.name}</div>
                          <div className="cell-secondary">{car.options}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-text">{car.plateNumber}</div>
                    </td>
                    <td>
                      <div className="cell-text">{car.options}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(car.status)}`}>{car.status}</span>
                    </td>
                    <td>
                      <button className="menu-button">⋮</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    {activeTab === 'all' ? '등록된 차량이 없습니다.' : '해당 상태의 차량이 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
