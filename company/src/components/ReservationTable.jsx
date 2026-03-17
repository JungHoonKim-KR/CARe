import React from 'react'
import './ReservationTable.css'

export default function ReservationTable({ reservations }) {
  const getStatusBadge = (status) => {
    const statusMap = {
      '이용중': 'badge-blue',
      '예약완료': 'badge-green',
      '반납완료': 'badge-gray',
      '분쟁중': 'badge-red',
    }
    return statusMap[status] || 'badge-gray'
  }

  return (
    <div className="reservation-table-container">
      <table className="reservation-table">
        <thead>
          <tr>
            <th>차량</th>
            <th>대여자</th>
            <th>일정</th>
            <th>장소</th>
            <th>금액</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>
                <div className="cell-with-icon">
                  <span className="cell-icon">🚗</span>
                  <div className="cell-content">
                    <div className="cell-primary">{reservation.carName}</div>
                    <div className="cell-secondary">{reservation.carType}</div>
                  </div>
                </div>
              </td>

              <td>
                <div className="cell-with-icon">
                  <span className="cell-icon">👤</span>
                  <div className="cell-content">
                    <div className="cell-primary">{reservation.renterName}</div>
                    <div className="cell-secondary">{reservation.renterCountry}</div>
                  </div>
                </div>
              </td>

              <td>
                <div className="cell-with-icon">
                  <span className="cell-icon">📅</span>
                  <div className="cell-content">
                    <div className="cell-primary">{reservation.startDate}</div>
                    <div className="cell-secondary">- {reservation.endDate}</div>
                  </div>
                </div>
              </td>

              <td>
                <div className="cell-with-icon">
                  <span className="cell-icon">📍</span>
                  <div className="cell-content">
                    <div className="cell-primary">{reservation.location}</div>
                  </div>
                </div>
              </td>

              <td>
                <div className="cell-amount">{reservation.amount}</div>
              </td>

              <td>
                <span className={`badge ${getStatusBadge(reservation.status)}`}>
                  {reservation.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
