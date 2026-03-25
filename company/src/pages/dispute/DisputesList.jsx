import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DisputeService from '../../services/DisputeService'
import './DisputesList.css'

export default function DisputesList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all') // all, pending, resolved
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDisputes()
  }, [])

  const formatDate = (isoDate) => {
    if (!isoDate) return '-'
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const toUiStatus = (status) => {
    if (status === 'RESOLVED') return 'resolved'
    return 'pending'
  }

  const fetchDisputes = async () => {
    setLoading(true)
    setError('')

    const result = await DisputeService.getDisputes()

    if (!result.success) {
      setError(result.message)
      setLoading(false)
      return
    }

    const formatted = (result.data || []).map((item) => ({
      id: item.disputeId,
      disputeId: item.disputeId,
      reservationId: item.reservationId,
      carName: `${item.brand || '-'} ${item.modelName || ''}`.trim(),
      carNumber: item.plateNumber || '-',
      renterName: item.renterName || '-',
      issueType: '차량 파손',
      status: toUiStatus(item.status),
      createdDate: formatDate(item.createdAt),
      amount: item.claimAmount || 0
    }))

    setDisputes(formatted)
    setLoading(false)
  }

  const filteredDisputes = disputes.filter(dispute => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return dispute.status === 'pending'
    if (activeTab === 'resolved') return dispute.status === 'resolved'
    return true
  })

  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'pending').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
  }

  const handleViewDetail = (disputeId) => {
    navigate(`/disputes/${disputeId}`)
  }

  return (
    <div className="disputes-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">분쟁 관리</h1>
          <p className="page-subtitle">렌터카 이용 중 발생한 분쟁을 관리하고 해결할 수 있습니다.</p>
        </div>
      </div>

      {/* Stats Cards
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">전체 분쟁</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">처리 중</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-label">해결 완료</div>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div> */}

      {/* Tab Filter */}
      <div className="tab-filter">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체 ({stats.total})
        </button>
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          처리 중 ({stats.pending})
        </button>
        <button
          className={`tab-button ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          해결 완료 ({stats.resolved})
        </button>
      </div>

      {/* Disputes Table */}
      <div className="disputes-table-wrapper">
        {loading && (
          <div className="empty-state">
            <p>분쟁 목록을 불러오는 중...</p>
          </div>
        )}

        {error && !loading && (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
        <table className="disputes-table">
          <thead>
            <tr>
              <th>분쟁 번호</th>
              <th>예약 번호</th>
              <th>차량 정보</th>
              <th>렌터</th>
              <th>분쟁 유형</th>
              <th>금액</th>
              <th>상태</th>
              <th>요청일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisputes.map((dispute) => (
              <tr key={dispute.id}>
                <td className="dispute-id">{dispute.disputeId}</td>
                <td className="reservation-id">{dispute.reservationId}</td>
                <td className="car-info">
                  <div className="car-name">{dispute.carName}</div>
                  <div className="car-number">{dispute.carNumber}</div>
                </td>
                <td>{dispute.renterName}</td>
                <td>
                  <span className={`issue-badge ${dispute.issueType === '차량 파손' ? 'damage' : ''}`}>
                    {dispute.issueType}
                  </span>
                </td>
                <td className="amount">{dispute.amount.toLocaleString()}원</td>
                <td>
                  <span className={`status-badge ${dispute.status}`}>
                    {dispute.status === 'pending' ? '처리 중' : '해결 완료'}
                  </span>
                </td>
                <td>{dispute.createdDate}</td>
                <td>
                  <button
                    className="btn-detail"
                    onClick={() => handleViewDetail(dispute.id)}
                  >
                    상세
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {!loading && !error && filteredDisputes.length === 0 && (
          <div className="empty-state">
            <p>해당하는 분쟁이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
