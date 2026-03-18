package com.care.domain.company.controller;

import com.care.domain.company.controller.dto.request.BizVerifyRequest;
import com.care.domain.company.controller.dto.response.BizVerifyResponse;
import com.care.domain.company.controller.dto.response.CompanyProfileResponse;
import com.care.domain.company.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies/me")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

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
}
