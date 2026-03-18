package com.care.domain.renter.controller;

import com.care.domain.renter.controller.dto.request.DocumentVerifyRequest;
import com.care.domain.renter.controller.dto.response.DocumentVerifyResponse;
import com.care.domain.renter.controller.dto.response.RenterProfileResponse;
import com.care.domain.renter.service.DocumentService;
import com.care.domain.renter.service.RenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/renters/me")
@RequiredArgsConstructor
public class RenterController {

    private final DocumentService documentService;
    private final RenterService renterService;

    // 프로필 조회 api
    @GetMapping
    public ResponseEntity<RenterProfileResponse> getProfile(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(renterService.getProfile(userId));
    }

    // 서류 검증 api
    @PostMapping("/documents")
    public ResponseEntity<DocumentVerifyResponse> verifyDocument(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody DocumentVerifyRequest request) {
        return ResponseEntity.ok(documentService.verifyDocument(userId, request));
    }
}
