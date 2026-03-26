import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NFTModal from '../../components/NFTModal'
import CarService from '../../services/CarService'
import './CarDetailPage.css'

export default function CarDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false)
  const [carData, setCarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCarDetail()
  }, [id])

  const fetchCarDetail = async () => {
    setLoading(true)
    setError(null)

    const result = await CarService.getCarDetail(id)

    if (result.success) {
      setCarData(result.data)
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
      MAINTENANCE: '점검중',
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
      HYBRID: '하이브리드',
      LPG: 'LPG'
    }
    return fuelMap[fuelType] || fuelType
  }

  const handleDelete = () => {
    if (window.confirm('정말 이 차량을 삭제하시겠습니까?')) {
      // 삭제 API 호출 로직
      console.log('차량 삭제:', id)
    }
  }

  const nftInfo = {
    tokenId: '0x1234 ... 5678',
    issueDate: '2026.01.15',
  }

  const defectLogs = [
    {
      id: 1,
      location: '앞 범퍼 좌측',
      type: '스크래치',
      date: '2026.01.15',
    },
    {
      id: 2,
      location: '뒷 휠 우측',
      type: '',
      date: '',
    },
  ]

  const operationStats = {
    totalReservations: 12,
    totalRevenue: '1,500,000원',
    avgRating: '4.8 / 5.0',
  }

  const recentReservations = [
    {
      id: 1,
      name: '김철수',
      period: '2026.03.05 - 2026.03.08',
      amount: '150,000원',
      status: '이용중',
    },
    {
      id: 2,
      name: '이영희',
      period: '2026.02.20 - 2026.02.23',
      amount: '150,000원',
      status: '반납완료',
    },
    {
      id: 3,
      name: '박민수',
      period: '2026.02.10 - 2026.02.12',
      amount: '100,000원',
      status: '반납완료',
    },
  ]

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      console.log('Delete car:', id)
      navigate('/cars')
    }
  }

  if (loading) {
    return (
      <div className="reservation-detail-page">
        <div className="page-header-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className="page-title">차량 상세</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reservation-detail-page">
        <div className="page-header-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className="page-title">차량 상세</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          {error}
        </div>
      </div>
    )
  }

  if (!carData) {
    return (
      <div className="reservation-detail-page">
        <div className="page-header-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className="page-title">차량 상세</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          차량 정보를 찾을 수 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="reservation-detail-page">
      <div className="page-header-bar">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="page-title">차량 상세</h1>
        <div className="header-actions">
          <button className="btn-secondary">수정</button>
          <button className="btn-danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="main-column">
          <div className="card car-info-card">
            <div className="car-header">
              <div className="car-image">
                <img
                  src={carData.frontImageUrl || carData.thumbnailUrl || 'https://via.placeholder.com/300x200'}
                  alt={`${carData.brand} ${carData.modelName}`}
                />
              </div>
              <div className="car-basic-info">
                <div className="car-title-row">
                  <h2 className="car-name">{carData.brand} {carData.modelName}</h2>
                  <div className="badge-group">
                    <span className="status-badge">{getStatusText(carData.status)}</span>
                    <button
                      className="nft-badge"
                      onClick={() => setIsNFTModalOpen(true)}
                      title="NFT 정보 보기"
                    >
                      NFT
                    </button>
                  </div>
                </div>
                <p className="car-plate">{carData.plateNumber}</p>
                <div className="car-specs">
                  <div className="spec-item">
                    <span className="spec-label">연료</span>
                    <span className="spec-value">{getFuelTypeText(carData.fuelType)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3 className="section-subtitle">차량 설명</h3>
              <p className="description-text">{carData.description}</p>
            </div>
          </div>

          <div className="card defect-log-card">
            <h3 className="card-title">초기 결함 로그 (AI 탐지)</h3>
            <div className="defect-list">
              {defectLogs.map((log) => (
                <div key={log.id} className="defect-item">
                  <div className="defect-info">
                    <span className="defect-location">{log.location}</span>
                    {log.type && <span className="defect-type">{log.type}</span>}
                    {log.date && <span className="defect-date">탐지일: {log.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-column">
          <div className="card stats-card">
            <h3 className="card-title">운영 통계</h3>
            <div className="stat-row">
              <span className="stat-label">총 예약 수</span>
              <span className="stat-value">{operationStats.totalReservations}건</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">총 수익</span>
              <span className="stat-value">{operationStats.totalRevenue}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">평균 평점</span>
              <span className="stat-value">{operationStats.avgRating}</span>
            </div>
          </div>

          <div className="card recent-reservations-card">
            <div className="card-header-row">
              <h3 className="card-title">최근 예약</h3>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/reservations')}
              >
                전체보기
              </button>
            </div>
            <div className="reservations-list">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="reservation-item">
                  <div className="reservation-header">
                    <span className="renter-name">{reservation.name}</span>
                    <span
                      className={`status-tag ${
                        reservation.status === '이용중' ? 'ongoing' : 'completed'
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                  <div className="reservation-period">{reservation.period}</div>
                  <div className="reservation-amount">{reservation.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NFTModal
        isOpen={isNFTModalOpen}
        onClose={() => setIsNFTModalOpen(false)}
        nftData={nftInfo}
      />
    </div>
  )
}
