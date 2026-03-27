package com.care.domain.scan.service;

import com.care.domain.reservation.entity.Scratch;
import com.care.domain.scan.dto.ScanResponseDto;
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
    private final ScanPersistService scanPersistService;
    private final RestTemplate restTemplate;

    @Value("${AI_YOLO_URL:http://localhost:8000}")
    private String aiServerUrl;

    // ── 픽업 전 스캔
    public List<ScanResponseDto> scanBefore(String reservationId, String zone, MultipartFile image) {
        return detect(reservationId, zone, "BEFORE", image);
    }

    // ── 반납 후 스캔
    public List<ScanResponseDto> scanAfter(String reservationId, String zone, MultipartFile image) {
        return detect(reservationId, zone, "AFTER", image);
    }

    // ── 스캔 결과 조회
    @Transactional(readOnly = true)
    public List<ScanResponseDto> getScanResult(String reservationId, String logType) {
        List<Scratch> scratches = scratchRepository
                .findByReservation_ReservationIdAndLogType(reservationId, logType);
        return ScanResponseDto.fromList(scratches);
    }

    // ── FastAPI 호출 (트랜잭션 밖) + DB 저장 (트랜잭션 안, 별도 서비스)
    private List<ScanResponseDto> detect(String reservationId, String zone,
                                         String logType, MultipartFile image) {
        // 1) AI 서버 호출 — 트랜잭션 밖에서 (S3 업로드 포함)
        Map<String, Object> response;
        try {
            response = callFastApi(image, zone, logType);
        } catch (Exception e) {
            log.warn("[Scan] AI 서버 호출 실패, 흠집 없음으로 처리 - zone: {}, reason: {}", zone, e.getMessage());
            response = Collections.emptyMap();
        }
        List<Map<String, Object>> defects =
                (List<Map<String, Object>>) response.get("defects");

        // 2) DB 저장 — 별도 서비스의 @Transactional 메서드로 호출
        return scanPersistService.saveDetectResult(reservationId, zone, logType, defects);
    }

    // ── FastAPI /detect 호출
    private Map<String, Object> callFastApi(MultipartFile image,
                                            String zone, String logType) {
        try {
            org.springframework.util.LinkedMultiValueMap<String, Object> body =
                    new org.springframework.util.LinkedMultiValueMap<>();
            String filename = image.getOriginalFilename();
            if (filename == null || filename.isBlank()) filename = "image.jpg";
            final String finalFilename = filename;
            body.add("image", new org.springframework.core.io.ByteArrayResource(
                    image.getBytes()) {
                @Override
                public String getFilename() { return finalFilename; }
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
            throw new RuntimeException("흠집 감지 서버 호출 실패: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ScanResponseDto> getScanResultByZone(String reservationId, String logType, String zone) {
        List<Scratch> scratches = scratchRepository
                .findByReservation_ReservationIdAndLogTypeAndCarPart(reservationId, logType, zone);
        return ScanResponseDto.fromList(scratches);
    }
}
