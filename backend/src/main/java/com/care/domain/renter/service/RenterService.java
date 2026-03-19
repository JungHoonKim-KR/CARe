package com.care.domain.renter.service;

import com.care.domain.renter.controller.dto.response.RenterProfileResponse;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.entity.RenterDocument;
import com.care.domain.renter.repository.RenterDocumentRepository;
import com.care.domain.renter.repository.RenterRepository;
import com.care.global.blockchain.DIDRegistryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RenterService {

    private final RenterRepository renterRepository;
    private final RenterDocumentRepository renterDocumentRepository;
    private final DIDRegistryService didRegistryService;

    @Transactional(readOnly = true)
    public RenterProfileResponse getProfile(String userId) {
        Renter renter = renterRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        List<RenterDocument> documents = renterDocumentRepository.findAllByRenter_UserId(userId);
        return new RenterProfileResponse(renter, documents);
    }

    @Transactional
    public String registerDid(String userId) throws Exception {
        Renter renter = renterRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // wallet_address 없으면 400
        if (renter.getWalletAddress() == null) {
            throw new IllegalArgumentException("지갑 주소가 없습니다. Privy 연동 후 이용해주세요.");
        }

        // 여권 + 국제면허증 둘 다 verified 확인
        List<RenterDocument> docs = renterDocumentRepository.findAllByRenter_UserId(userId);
        boolean passportVerified = docs.stream()
                .anyMatch(d -> d.getDocType() == RenterDocument.DocType.PASSPORT && d.isVerified());
        boolean licenseVerified = docs.stream()
                .anyMatch(d -> d.getDocType() == RenterDocument.DocType.INT_LICENSE && d.isVerified());

        if (!passportVerified || !licenseVerified) {
            throw new IllegalArgumentException("여권과 국제면허증 인증을 모두 완료해야 합니다.");
        }

        // DID URI 생성
        String didUri = didRegistryService.buildDidUri(renter.getWalletAddress());

        // 이미 등록된 경우 스킵
        if (!didRegistryService.isRegistered(didUri)) {
            didRegistryService.registerDID(didUri, null);
        }

        // DB 업데이트
        renter.updateDid(didUri);

        return didUri;
    }
}
