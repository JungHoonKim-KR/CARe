package com.care.domain.reservation.controller;

import com.care.domain.reservation.controller.dto.request.DisputeCreateRequest;
import com.care.domain.reservation.controller.dto.request.DisputeDefenseRequest;
import com.care.domain.reservation.controller.dto.response.DisputeCreateResponse;
import com.care.domain.reservation.controller.dto.response.DisputeDefenseResponse;
import com.care.domain.reservation.controller.dto.response.DisputeDetailResponse;
import com.care.domain.reservation.service.DisputeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reservations/{reservationId}/disputes")
public class DisputeController {

	private final DisputeService disputeService;

	@PostMapping
	public ResponseEntity<DisputeCreateResponse> createDispute(
			@AuthenticationPrincipal String userId,
			@PathVariable String reservationId,
			@Valid @RequestBody DisputeCreateRequest request
	) {
		return ResponseEntity.ok(disputeService.createDispute(userId, reservationId, request));
	}

	@GetMapping("/{disputeId}")
	public ResponseEntity<DisputeDetailResponse> getDisputeDetail(
			@AuthenticationPrincipal String userId,
			@PathVariable String reservationId,
			@PathVariable String disputeId
	) {
		return ResponseEntity.ok(disputeService.getDisputeDetail(userId, reservationId, disputeId));
	}

	@PostMapping("/{disputeId}/defense")
	public ResponseEntity<DisputeDefenseResponse> defendDispute(
			@AuthenticationPrincipal String userId,
			@PathVariable String reservationId,
			@PathVariable String disputeId,
			@Valid @RequestBody DisputeDefenseRequest request
	) {
		return ResponseEntity.ok(disputeService.defendDispute(userId, reservationId, disputeId, request));
	}
}
