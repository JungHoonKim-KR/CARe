package com.care.domain.reservation.controller;

import com.care.domain.reservation.controller.dto.request.DisputeSettleRequest;
import com.care.domain.reservation.controller.dto.response.DisputeSettleResponse;
import com.care.domain.reservation.service.DisputeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/disputes")
public class DisputeSettlementController {

    private final DisputeService disputeService;

    @PostMapping("/{disputeId}/settle")
    public ResponseEntity<DisputeSettleResponse> settleDispute(
            @AuthenticationPrincipal String userId,
            @PathVariable String disputeId,
            @Valid @RequestBody DisputeSettleRequest request
    ) {
        return ResponseEntity.ok(disputeService.settleDispute(userId, disputeId, request));
    }
}
