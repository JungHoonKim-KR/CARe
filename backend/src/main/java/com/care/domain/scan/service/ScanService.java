package com.care.domain.scan.service;

import com.care.domain.reservation.entity.Scratch;
import com.care.domain.scan.repository.ScratchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScanService {

    private final ScratchRepository scratchRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServerUrl;

    // ── 픽업 전 스캔
    @Transactional
    public List<Scratch> scanBefore(String reservationId, String carId,
                                    String zone, MultipartFile image) {
        return detect(reservationId, carId, zone, "BEFORE", image);
    }

    // ── 반납 후 스캔
    @Transactional
    public List<Scratch> scanAfter(String reservationId, String carId,
                                   String zone, MultipartFile image) {
        return detect(reservationId, carId, zone, "AFTER", image);
    }

    // ── 스캔 결과 조회
    @Transactional(readOnly = true)
    public List<Scratch> getScanResult(String reservationId, String logType) {
        return scratchRepository.findByReservation_ReservationIdAndLogType(reservationId, logType);
    }

    // ── FastAPI 호출 + DB 저장
    private List<Scratch> detect(String reservationId, String carId,
                                 String zone, String logType, MultipartFile image) {
        // FastAPI 호출
        Map<String, Object> response = callFastApi(image, zone, logType);

        // 응답 파싱
        List<Map<String, Object>> defects =
                (List<Map<String, Object>>) response.get("defects");

        if (defects == null || defects.isEmpty()) {
            log.info("[Scan] 흠집 없음 - reservationId: {}, zone: {}", reservationId, zone);
            return Collections.emptyList();
        }

        // DB 저장
        List<Scratch> scratches = new ArrayList<>();
        for (Map<String, Object> defect : defects) {
            Map<String, Object> bbox = (Map<String, Object>) defect.get("bbox");
            // TODO: ReservationRepository 생기면 구현

//            Scratch scratch = Scratch.builder()
//                    .logId(UUID.randomUUID().toString())
//                    .reservationId(reservationId)
//                    .carId(carId)
//                    .logType(logType)
//                    .carPart(zone)
//                    .coordX(((Number) bbox.get("x")).floatValue())
//                    .coordY(((Number) bbox.get("y")).floatValue())
//                    .originalS3Url((String) defect.get("original_s3_url"))
//                    .cropS3Url((String) defect.get("crop_s3_url"))
//                    .proofIpfsCid((String) defect.get("proof_ipfs_cid"))
//                    .isManual(false)
//                    .isDisputed(false)
//                    .build();
//
//            scratches.add(scratchRepository.save(scratch));
        }

        log.info("[Scan] 흠집 {}개 저장 - reservationId: {}, zone: {}",
                scratches.size(), reservationId, zone);
        return scratches;
    }

    // ── FastAPI /detect 호출
    private Map<String, Object> callFastApi(MultipartFile image,
                                            String zone, String logType) {
        try {
            org.springframework.util.LinkedMultiValueMap<String, Object> body =
                    new org.springframework.util.LinkedMultiValueMap<>();
            body.add("image", new org.springframework.core.io.ByteArrayResource(
                    image.getBytes()) {
                @Override
                public String getFilename() { return image.getOriginalFilename(); }
            });
            body.add("zone", zone);
            body.add("log_type", logType);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ResponseEntity<Map> res = restTemplate.exchange(
                    aiServerUrl + "/api/v1/scratches/detect",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            return res.getBody() != null ? res.getBody() : Collections.emptyMap();
        } catch (Exception e) {
            log.error("[Scan] FastAPI 호출 실패: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }
}