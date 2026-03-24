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
		String snapshotBeforeLogId,
		String snapshotBeforeCropS3Url,
		String snapshotAfterCropS3Url,
		Double snapshotSimilarity,
		Double snapshotDiffScore,
		Double snapshotThreshold,
		boolean snapshotWarning,
		LocalDateTime snapshotCapturedAt,
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
				dispute.getSnapshotBeforeLogId(),
				dispute.getSnapshotBeforeCropS3Url(),
				dispute.getSnapshotAfterCropS3Url(),
				dispute.getSnapshotSimilarity(),
				dispute.getSnapshotDiffScore(),
				dispute.getSnapshotThreshold(),
				dispute.isSnapshotWarning(),
				dispute.getSnapshotCapturedAt(),
				dispute.getCreatedAt(),
				dispute.getUpdatedAt()
		);
	}
}
