package com.care.domain.reservation.controller.dto.response;

import com.care.domain.reservation.entity.Settlement;

import java.time.LocalDateTime;

public record DisputeSettleResponse(
    String settlementId,
    String reservationId,
    long finalAmount,
    String status,
    LocalDateTime settledAt,
    String txHash
) {
    public static DisputeSettleResponse from(Settlement settlement) {
        return new DisputeSettleResponse(
                settlement.getSettlementId(),
                settlement.getReservation().getReservationId(),
                settlement.getFinalAmount(),
                settlement.getStatus(),
                settlement.getSettledAt(),
                settlement.getTxHash()
        );
    }
}
