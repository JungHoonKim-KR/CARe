package com.care.domain.scan.service;

import com.care.domain.reservation.entity.Reservation;
import com.care.domain.reservation.entity.Scratch;
import com.care.domain.reservation.repository.ReservationRepository;
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
    private final ReservationRepository reservationRepository;
    private final RestTemplate restTemplate;

    @Value("${AI_YOLO_URL:http://localhost:8000}")
    private String aiServerUrl;

    // ── 픽업 전 스캔
    @Transactional
    public List<ScanResponseDto> scanBefore(String reservationId, String zone, MultipartFile image) {
        return detect(reservationId, zone, "BEFORE", image);
    }

    // ── 반납 후 스캔
    @Transactional
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

    // ── FastAPI 호출 + DB 저장
    private List<ScanResponseDto> detect(String reservationId, String zone,
                                         String logType, MultipartFile image) {
        // 예약 조회
        Reservation reservation = reservationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다: " + reservationId));

        // FastAPI 호출
        Map<String, Object> response = callFastApi(image, zone, logType);
        List<Map<String, Object>> defects =
                (List<Map<String, Object>>) response.get("defects");

        if (defects == null || defects.isEmpty()) {
            log.info("[Scan] 흠집 없음 - reservationId: {}, zone: {}", reservationId, zone);
            if (logType.equals("BEFORE")) {
                reservation.updateStatusToInUse();
            } else {
                reservation.updateStatusToAfterScan();
            }
            return Collections.emptyList();
        }

        // DB 저장
        List<Scratch> scratches = new ArrayList<>();
        for (Map<String, Object> defect : defects) {
            Map<String, Object> bbox = (Map<String, Object>) defect.get("bbox");

            Scratch scratch = Scratch.builder()
                    .logId(UUID.randomUUID().toString())
                    .reservation(reservation)
                    .ownedCar(reservation.getOwnedCar())
                    .logType(logType)
                    .carPart(zone)
                    .coordX(((Number) bbox.get("x")).floatValue())
                    .coordY(((Number) bbox.get("y")).floatValue())
                    .originalS3Url((String) defect.get("original_s3_url"))
                    .cropS3Url((String) defect.get("crop_s3_url"))
                    .proofIpfsCid((String) defect.get("proof_ipfs_cid"))
                    .isManual(false)
                    .isDisputed(false)
                    .build();

            scratches.add(scratchRepository.save(scratch));
        }

        if (logType.equals("BEFORE")) {
            reservation.updateStatusToInUse();
        } else {
            reservation.updateStatusToAfterScan();
        }

        log.info("[Scan] 흠집 {}개 저장 - reservationId: {}, zone: {}",
                scratches.size(), reservationId, zone);
        return ScanResponseDto.fromList(scratches);
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