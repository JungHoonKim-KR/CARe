import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ReservationList.css'

export default function ReservationList({ reservations }) {
  const navigate = useNavigate()

  const getStatusBadge = (status) => {
    const statusMap = {
      '이용중': 'badge-blue',
      '예약완료': 'badge-green',
      '반납완료': 'badge-gray',
      '분쟁중': 'badge-red',
    }
    return statusMap[status] || 'badge-gray'
  }

  const handleRowClick = (reservationId) => {
    navigate(`/reservations/${reservationId}`)
  }

  return (
    <div className="reservation-table-wrapper">
      <table className="reservation-table">
        <thead>
          <tr>
            <th>차량명</th>
            <th>고객명</th>
            <th>예약일</th>
            <th>금액</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr
              key={reservation.id}
              onClick={() => handleRowClick(reservation.id)}
            >
              <td className="car-name">{reservation.carName}</td>
              <td>{reservation.customerName}</td>
              <td>{reservation.date}</td>
              <td className="amount">{reservation.amount}</td>
              <td>
                <span className={`status-badge ${getStatusBadge(reservation.status)}`}>
                  {reservation.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reservations.length === 0 && (
        <div className="empty-state">
          <p>예약 내역이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
