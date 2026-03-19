package com.care.domain.reservation.controller.dto.response;

import com.care.domain.reservation.entity.Dispute;

import java.time.LocalDateTime;

public record DisputeDetailResponse(
		String disputeId,
		String reservationId,
		String targetLogId,
		String defenseLogId,
		String status,
		String reason,
		int claimAmount,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
) {
	public static DisputeDetailResponse from(Dispute dispute) {
		return new DisputeDetailResponse(
				dispute.getDisputeId(),
				dispute.getReservation().getReservationId(),
				dispute.getTargetScratch().getLogId(),
				dispute.getDefenseScratch() != null ? dispute.getDefenseScratch().getLogId() : null,
				dispute.getStatus(),
				dispute.getReason(),
				dispute.getClaimAmount(),
				dispute.getCreatedAt(),
				dispute.getUpdatedAt()
		);
	}
}
