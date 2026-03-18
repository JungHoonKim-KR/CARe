package com.care.domain.scan.controller;

import com.care.domain.reservation.entity.Scratch;
import com.care.domain.scan.service.ScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/scan")
@RequiredArgsConstructor
public class ScanController {

    private final ScanService scanService;

    // 픽업 전 스캔
    @PostMapping("/{reservationId}/before")
    public ResponseEntity<List<Scratch>> scanBefore(
            @PathVariable String reservationId,
            @RequestParam String carId,
            @RequestParam String zone,
            @RequestParam MultipartFile image
    ) {
        List<Scratch> result = scanService.scanBefore(reservationId, carId, zone, image);
        return ResponseEntity.ok(result);
    }

    // 반납 후 스캔
    @PostMapping("/{reservationId}/after")
    public ResponseEntity<List<Scratch>> scanAfter(
            @PathVariable String reservationId,
            @RequestParam String carId,
            @RequestParam String zone,
            @RequestParam MultipartFile image
    ) {
        List<Scratch> result = scanService.scanAfter(reservationId, carId, zone, image);
        return ResponseEntity.ok(result);
    }

    // 스캔 결과 조회
    @GetMapping("/{reservationId}")
    public ResponseEntity<List<Scratch>> getScanResult(
            @PathVariable String reservationId,
            @RequestParam(defaultValue = "BEFORE") String logType
    ) {
        List<Scratch> result = scanService.getScanResult(reservationId, logType);
        return ResponseEntity.ok(result);
    }
}