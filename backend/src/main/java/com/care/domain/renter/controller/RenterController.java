package com.care.domain.renter.controller;

import com.care.domain.renter.controller.dto.request.DocumentVerifyRequest;
import com.care.domain.renter.controller.dto.request.TokenChargeRequest;
import com.care.domain.renter.controller.dto.response.DocumentVerifyResponse;
import com.care.domain.renter.controller.dto.response.RenterProfileResponse;
import com.care.domain.renter.controller.dto.response.TokenChargeResponse;
import com.care.domain.renter.service.DocumentService;
import com.care.domain.renter.service.RenterService;
import com.care.domain.renter.service.RenterTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/renters/me")
@RequiredArgsConstructor
public class RenterController {

    private final DocumentService documentService;
    private final RenterService renterService;
    private final RenterTokenService renterTokenService;

    @GetMapping
    public ResponseEntity<RenterProfileResponse> getProfile(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(renterService.getProfile(userId));
    }

    @PostMapping("/documents")
    public ResponseEntity<DocumentVerifyResponse> verifyDocument(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody DocumentVerifyRequest request) {
        return ResponseEntity.ok(documentService.verifyDocument(userId, request));
    }

    /**
     * POST /renters/me/token/charge
     * CARE 토큰 충전
     */
    @PostMapping("/token/charge")
    public ResponseEntity<TokenChargeResponse> chargeToken(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody TokenChargeRequest request) {
        return ResponseEntity.ok(renterTokenService.charge(userId, request.amount()));
    }

    /**
     * GET /renters/me/token/balance
     * CARE 토큰 잔액 조회
     */
    @GetMapping("/token/balance")
    public ResponseEntity<Map<String, String>> getBalance(
            @AuthenticationPrincipal String userId) {
        String balance = renterTokenService.getBalance(userId);
        return ResponseEntity.ok(Map.of("balance", balance));
    }
}
