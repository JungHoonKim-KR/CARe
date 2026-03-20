package com.care.domain.reservation.controller.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record ReservationCreateRequest(
        @NotBlank String carId,
        @NotBlank String insuranceId,
        LocalDateTime pickupDate,
        LocalDateTime returnDate,
        @Positive int totalPrice
) {}
