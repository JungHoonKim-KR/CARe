package com.care.domain.reservation.controller.dto.response;

import com.care.domain.reservation.entity.Reservation;

import java.time.LocalDateTime;

public record ReservationSummaryResponse(
        String reservationId,
        String status,
        String depositStatus,
        String carId,
        String plateNumber,
        String brand,
        String modelName,
        String insuranceName,
        LocalDateTime createdAt
) {
    public static ReservationSummaryResponse from(Reservation r) {
        return new ReservationSummaryResponse(
                r.getReservationId(),
                r.getStatus(),
                r.getDepositStatus() != null ? r.getDepositStatus().name() : null,
                r.getOwnedCar().getCarId(),
                r.getOwnedCar().getPlateNumber(),
                r.getOwnedCar().getCarModel().getBrand(),
                r.getOwnedCar().getCarModel().getModelName(),
                r.getInsurance().getName(),
                r.getCreatedAt()
        );
    }
}
