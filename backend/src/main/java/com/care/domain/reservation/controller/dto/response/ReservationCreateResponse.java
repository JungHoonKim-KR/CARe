package com.care.domain.reservation.controller.dto.response;

import com.care.domain.reservation.entity.Reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationCreateResponse(
        String reservationId,
        String status,
        String carId,
        String insuranceId,
        LocalDate pickupDate,
        LocalDate returnDate,
        int totalPrice,
        String paymentTxHash
) {
    public static ReservationCreateResponse from(Reservation r) {
        return new ReservationCreateResponse(
                r.getReservationId(),
                r.getStatus(),
                r.getOwnedCar().getCarId(),
                r.getInsurance().getInsuranceId(),
                r.getPickupDate(),
                r.getReturnDate(),
                r.getTotalPrice(),
                r.getPaymentTxHash()
        );
    }
}
