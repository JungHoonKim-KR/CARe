package com.care.domain.reservation.service;

import com.care.domain.reservation.controller.dto.request.DisputeCreateRequest;
import com.care.domain.reservation.controller.dto.request.DisputeDefenseRequest;
import com.care.domain.reservation.controller.dto.request.DisputeSettleRequest;
import com.care.domain.reservation.controller.dto.response.DisputeCreateResponse;
import com.care.domain.reservation.controller.dto.response.DisputeDefenseResponse;
import com.care.domain.reservation.controller.dto.response.DisputeDetailResponse;
import com.care.domain.reservation.controller.dto.response.DisputeSettleResponse;
import com.care.domain.reservation.entity.Dispute;
import com.care.domain.reservation.entity.DisputeStatus;
import com.care.domain.reservation.entity.Reservation;
import com.care.domain.reservation.entity.Settlement;
import com.care.domain.reservation.entity.SettlementStatus;
import com.care.domain.reservation.entity.Scratch;
import com.care.domain.reservation.repository.DisputeRepository;
import com.care.domain.reservation.repository.ReservationRepository;
import com.care.domain.reservation.repository.SettlementRepository;
import com.care.domain.scan.repository.ScratchRepository;
import com.care.global.blockchain.DisputeSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DisputeService {

	private final DisputeRepository disputeRepository;
	private final ReservationRepository reservationRepository;
	private final ScratchRepository scratchRepository;
	private final SettlementRepository settlementRepository;
	private final DisputeSettlementService disputeSettlementService;

	@Transactional
	public DisputeCreateResponse createDispute(String requesterId,
											   String reservationId,
											   DisputeCreateRequest request) {
		Reservation reservation = reservationRepository.findByReservationId(reservationId)
				.orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다: " + reservationId));

		validateCompanyAccess(requesterId, reservation);

		Scratch targetScratch = scratchRepository.findById(request.getTargetLogId())
				.orElseThrow(() -> new IllegalArgumentException("대상 흠집 로그를 찾을 수 없습니다: " + request.getTargetLogId()));

		validateScratchBelongsToReservation(targetScratch, reservationId);
		validateLogType(targetScratch, "AFTER", "targetLogId는 AFTER 로그여야 합니다.");

		boolean hasActiveDispute = disputeRepository.existsByTargetScratch_LogIdAndStatusNot(
				targetScratch.getLogId(), DisputeStatus.RESOLVED.name());
		if (hasActiveDispute || targetScratch.isDisputed()) {
			throw new IllegalArgumentException("이미 분쟁이 진행 중인 흠집입니다.");
		}

		Dispute dispute = Dispute.create(
				reservation,
				targetScratch,
				request.getReason(),
				request.getClaimAmount()
		);

		targetScratch.markDisputed();
		Dispute saved = disputeRepository.save(dispute);
		return DisputeCreateResponse.from(saved);
	}

	@Transactional(readOnly = true)
	public DisputeDetailResponse getDisputeDetail(String requesterId,
												  String reservationId,
												  String disputeId) {
		Dispute dispute = disputeRepository.findByDisputeIdAndReservation_ReservationId(disputeId, reservationId)
				.orElseThrow(() -> new IllegalArgumentException("분쟁을 찾을 수 없습니다: " + disputeId));

		validateParticipantAccess(requesterId, dispute.getReservation());
		return DisputeDetailResponse.from(dispute);
	}

	@Transactional
	public DisputeDefenseResponse defendDispute(String requesterId,
												String reservationId,
												String disputeId,
												DisputeDefenseRequest request) {
		Dispute dispute = disputeRepository.findByDisputeIdAndReservation_ReservationId(disputeId, reservationId)
				.orElseThrow(() -> new IllegalArgumentException("분쟁을 찾을 수 없습니다: " + disputeId));

		validateRenterAccess(requesterId, dispute.getReservation());

		Scratch defenseScratch = scratchRepository.findById(request.getDefenseLogId())
				.orElseThrow(() -> new IllegalArgumentException("방어 흠집 로그를 찾을 수 없습니다: " + request.getDefenseLogId()));

		validateScratchBelongsToReservation(defenseScratch, reservationId);
		validateLogType(defenseScratch, "BEFORE", "defenseLogId는 BEFORE 로그여야 합니다.");

		dispute.defend(defenseScratch);
		return DisputeDefenseResponse.from(dispute);
	}

	private void validateCompanyAccess(String requesterId, Reservation reservation) {
		String companyId = reservation.getOwnedCar().getCompany().getCompanyId();
		if (!companyId.equals(requesterId)) {
			throw new IllegalArgumentException("분쟁 생성 권한이 없습니다.");
		}
	}

	private void validateRenterAccess(String requesterId, Reservation reservation) {
		String renterId = reservation.getRenter().getUserId();
		if (!renterId.equals(requesterId)) {
			throw new IllegalArgumentException("분쟁 방어 권한이 없습니다.");
		}
	}

	private void validateParticipantAccess(String requesterId, Reservation reservation) {
		String renterId = reservation.getRenter().getUserId();
		String companyId = reservation.getOwnedCar().getCompany().getCompanyId();
		if (!renterId.equals(requesterId) && !companyId.equals(requesterId)) {
			throw new IllegalArgumentException("분쟁 조회 권한이 없습니다.");
		}
	}

	private void validateScratchBelongsToReservation(Scratch scratch, String reservationId) {
		String scratchReservationId = scratch.getReservation().getReservationId();
		if (!reservationId.equals(scratchReservationId)) {
			throw new IllegalArgumentException("해당 예약의 흠집 로그가 아닙니다.");
		}
	}

	private void validateLogType(Scratch scratch, String expectedLogType, String errorMessage) {
		if (!expectedLogType.equalsIgnoreCase(scratch.getLogType())) {
			throw new IllegalArgumentException(errorMessage);
		}
	}
	@Transactional
    public DisputeSettleResponse settleDispute(String requesterId, String disputeId, DisputeSettleRequest request) {
        Dispute dispute = disputeRepository.findByDisputeId(disputeId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 분쟁입니다: " + disputeId));
		Reservation reservation = dispute.getReservation();
		validateCompanyAccess(requesterId, reservation);

		SettlementStatus targetStatus = SettlementStatus.from(request.getStatus());
		if (targetStatus == SettlementStatus.PENDING) {
			throw new IllegalArgumentException("정산 API에서는 PENDING 상태를 사용할 수 없습니다.");
		}

		Settlement settlement = Settlement.createPending(reservation);
		settlementRepository.save(settlement);

		String txHash;
		try {
			txHash = disputeSettlementService.recordSettlement(settlement.getSettlementId(), request.getFinalAmount());
		} catch (Exception e) {
			throw new RuntimeException("온체인 정산 처리에 실패했습니다.", e);
		}

		settlement.complete(request.getFinalAmount(), txHash, targetStatus);
		dispute.resolve();
		dispute.getTargetScratch().clearDisputed();

		return DisputeSettleResponse.from(settlement);
    }
}
