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

  const handleItemClick = (reservationId) => {
    navigate(`/reservations/${reservationId}`)
  }

  return (
    <div className="reservation-list">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="reservation-item"
          onClick={() => handleItemClick(reservation.id)}
        >
          <div className="reservation-left">
            <div className="car-info">
              <div className="car-name">{reservation.carName}</div>
              <div className="customer-date">
                {reservation.customerName} · {reservation.date}
              </div>
            </div>
          </div>

          <div className="reservation-right">
            <div className="reservation-amount">{reservation.amount}</div>
            <span className={`badge ${getStatusBadge(reservation.status)}`}>
              {reservation.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
