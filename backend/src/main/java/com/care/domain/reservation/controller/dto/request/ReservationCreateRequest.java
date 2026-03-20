package com.care.domain.reservation.controller.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReservationCreateRequest(
        @NotBlank String carId,
        @NotBlank String insuranceId,
        @NotNull LocalDate pickupDate,
        @NotNull LocalDate returnDate
) {}
