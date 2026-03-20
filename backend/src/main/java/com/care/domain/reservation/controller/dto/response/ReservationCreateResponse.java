package com.care.domain.reservation.controller.dto.response;

import com.care.domain.reservation.entity.Reservation;

public record ReservationCreateResponse(
        String reservationId,
        String status,
        String carId,
        String insuranceId,
        int totalPrice,
        String paymentTxHash
) {
    public static ReservationCreateResponse from(Reservation r) {
        return new ReservationCreateResponse(
                r.getReservationId(),
                r.getStatus(),
                r.getOwnedCar().getCarId(),
                r.getInsurance().getInsuranceId(),
                r.getTotalPrice(),
                r.getPaymentTxHash()
        );
    }
}
