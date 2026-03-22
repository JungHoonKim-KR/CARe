package com.care.domain.company.controller;

import com.care.domain.company.controller.dto.request.BizVerifyRequest;
import com.care.domain.company.controller.dto.response.BizVerifyResponse;
import com.care.domain.company.controller.dto.response.CompanyProfileResponse;
import com.care.domain.company.service.CompanyService;
import com.care.domain.reservation.controller.dto.response.ReservationSummaryResponse;
import com.care.domain.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies/me")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final ReservationService reservationService;

    // 프로필 조회 api
    @GetMapping
    public ResponseEntity<CompanyProfileResponse> getProfile(@AuthenticationPrincipal String companyId) {
        return ResponseEntity.ok(companyService.getProfile(companyId));
    }

    // 서류 검증 api
    @PostMapping("/biz-verify")
    public ResponseEntity<BizVerifyResponse> verifyBusiness(
            @AuthenticationPrincipal String companyId,
            @Valid @RequestBody BizVerifyRequest request) {
        return ResponseEntity.ok(companyService.verifyBusiness(companyId, request));
    }

    /**
     * GET /companies/me/reservations
     * 회사 예약 목록 조회
     */
    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationSummaryResponse>> getReservations(@AuthenticationPrincipal String companyId) {
        return ResponseEntity.ok(reservationService.getCompanyReservations(companyId));
    }
}
