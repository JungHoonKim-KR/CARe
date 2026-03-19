package com.care.domain.company.service;

import com.care.domain.company.controller.dto.response.InsuranceResponse;
import com.care.domain.company.exception.CompanyErrorCode;
import com.care.domain.company.repository.InsuranceRepository;
import com.care.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private final InsuranceRepository insuranceRepository;

    @Transactional(readOnly = true)
    public List<InsuranceResponse> getInsuranceList(String companyId) {
        return insuranceRepository.findByCompanyCompanyId(companyId).stream()
                .map(InsuranceResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InsuranceResponse getInsurance(String insuranceId) {
        return insuranceRepository.findById(insuranceId)
                .map(InsuranceResponse::from)
                .orElseThrow(() -> new BusinessException(CompanyErrorCode.INSURANCE_NOT_FOUND));
    }
}
