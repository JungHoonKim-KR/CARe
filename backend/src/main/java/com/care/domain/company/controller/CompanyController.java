package com.care.domain.company.controller;

import com.care.domain.company.controller.dto.request.BizVerifyRequest;
import com.care.domain.company.controller.dto.response.BizVerifyResponse;
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

    @PostMapping("/biz-verify")
    public ResponseEntity<BizVerifyResponse> verifyBusiness(
            @AuthenticationPrincipal String companyId,
            @Valid @RequestBody BizVerifyRequest request) {
        return ResponseEntity.ok(companyService.verifyBusiness(companyId, request));
    }
}
