package com.care.domain.reservation.controller.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;

@Getter
public class DisputeSettleRequest {

    @PositiveOrZero
    private long finalAmount;

    @NotBlank
    private String status;
}
