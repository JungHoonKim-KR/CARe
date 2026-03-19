package com.care.domain.renter.service;

import com.care.domain.renter.controller.dto.request.DocumentVerifyRequest;
import com.care.domain.renter.controller.dto.response.DocumentVerifyResponse;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.entity.RenterDocument;
import com.care.domain.renter.repository.RenterDocumentRepository;
import com.care.domain.renter.repository.RenterRepository;
import com.care.global.external.apick.ApickVerifyClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final RenterRepository renterRepository;
    private final RenterDocumentRepository renterDocumentRepository;
    private final ApickVerifyClient apickVerifyClient;

    @Transactional
    public DocumentVerifyResponse verifyDocument(String userId, DocumentVerifyRequest request) { // 임차인 서류 인증
        // ID가 존재하지 않을 때
        Renter renter = renterRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 서류 타입(여권/면허증)에 따라 구분
        boolean verified = switch (request.getDocType()) {
            case PASSPORT -> apickVerifyClient.verifyPassport(
                    request.getPassportName(),
                    request.getPassportNo(),
                    request.getBirthDate(),
                    request.getIssueDate(),
                    request.getExpiryDate()
            );
            case INT_LICENSE -> apickVerifyClient.verifyDriverLicense(
                    request.getBirthY(),
                    request.getBirthM(),
                    request.getBirthD(),
                    request.getName(),
                    request.getLicenZero(),
                    request.getLicenFirst(),
                    request.getLicenSecond(),
                    request.getLicenThird()
            );
        };

        // 기존 서류 있으면 업데이트, 없으면 신규 저장
        RenterDocument doc = renterDocumentRepository
                .findByRenter_UserIdAndDocType(userId, request.getDocType())
                .orElse(RenterDocument.of(UUID.randomUUID().toString(), renter, request.getDocType(), verified));

        renterDocumentRepository.save(doc);

        // Apick 응답을 필요한 형태로 변환 (신원 정보 ID/TYPE/인증여부)
        return new DocumentVerifyResponse(doc.getDocId(), doc.getDocType(), verified);
    }
}
