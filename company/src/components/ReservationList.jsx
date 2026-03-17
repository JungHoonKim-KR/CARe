import React from 'react'
import './ReservationList.css'

export default function ReservationList({ reservations }) {
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
    <div className="reservation-list">
      {reservations.map((reservation) => (
        <div key={reservation.id} className="reservation-item">
          <div className="reservation-car">
            <span className="car-icon">🚗</span>
            <div className="car-info">
              <div className="car-name">{reservation.carName}</div>
              <div className="customer-name">{reservation.customerName}</div>
            </div>
          </div>

          <div className="reservation-date">{reservation.date}</div>

          <div className="reservation-amount">{reservation.amount}</div>

          <div className="reservation-status">
            <span className={`badge ${getStatusBadge(reservation.status)}`}>
              {reservation.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
