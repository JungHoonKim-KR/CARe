package com.care.domain.reservation.controller.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ReservationCreateRequest(
        @NotBlank String carId,
        @NotBlank String insuranceId,
        @Positive int totalPrice
) {}
