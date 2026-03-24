import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NFTModal from '../../components/NFTModal'
import './CarDetailPage.css'

export default function CarDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false)


  // 백엔드 연동 시
  // const { id } = useParams()
  // useEffect(() => {
  //   fetchReservationDetail(id)
  // }, [id])


  const carData = {
    name: '현대 아반떼',
    plateNumber: '12가 3456',
    type: '세단',
    year: '2024년식',
    seats: '5인승',
    fuelType: '가솔린',
    location: '서울 강남구 테헤란로 123',
    status: '대여가능',
    dailyRate: '50,000원',
    deposit: '100,000원',
    description: '깨끗하게 관리된 차량입니다. 블루핸즈, 네비게이션 장착.',
    image: 'https://via.placeholder.com/300x200',
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
                <img src={carData.image} alt={carData.name} />
              </div>
              <div className="car-basic-info">
                <div className="car-title-row">
                  <h2 className="car-name">{carData.name}</h2>
                  <div className="badge-group">
                    <span className="status-badge">{carData.status}</span>
                    <button
                      className="nft-badge"
                      onClick={() => setIsNFTModalOpen(true)}
                      title="NFT 정보 보기"
                    >
                      🔗 NFT
                    </button>
                  </div>
                </div>
                <p className="car-plate">{carData.plateNumber}</p>
                <div className="car-specs">
                  <div className="spec-item">
                    <span className="spec-label">세단</span>
                    <span className="spec-value">{carData.type}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-value">{carData.year}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-value">{carData.seats}</span>
                  </div>
                </div>
                <div className="car-location">
                  <span className="spec-label">기름칸</span>
                  <span className="spec-value">{carData.fuelType}</span>
                </div>
                <div className="car-location">
                  <span className="location-value">{carData.location}</span>
                </div>
              </div>
            </div>

            <div className="pricing-section">
              <div className="price-item">
                <span className="price-label">일일 대여료</span>
                <span className="price-value">{carData.dailyRate}</span>
              </div>
              <div className="price-item">
                <span className="price-label">보증금</span>
                <span className="price-value">{carData.deposit}</span>
              </div>
            </div>

            <div className="description-section">
              <h3 className="section-subtitle">차량 설명</h3>
              <p className="description-text">{carData.description}</p>
            </div>
          </div>

          <div className="card nft-info-card">
            <h3 className="card-title">NFT 정보</h3>
            <div className="nft-info-row">
              <span className="nft-label">Token ID</span>
              <span className="nft-value">{nftInfo.tokenId}</span>
            </div>
            <div className="nft-info-row">
              <span className="nft-label">발행일</span>
              <span className="nft-value">{nftInfo.issueDate}</span>
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
              <button className="view-all-btn">전체보기</button>
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
