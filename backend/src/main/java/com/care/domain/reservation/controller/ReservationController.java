package com.care.domain.reservation.controller;

import com.care.domain.reservation.controller.dto.response.ReservationDetailResponse;
import com.care.domain.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * GET /reservations/{reservationId}
     * 예약 상세 조회
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<ReservationDetailResponse> getReservationDetail(@PathVariable String reservationId) {
        return ResponseEntity.ok(reservationService.getReservationDetail(reservationId));
    }
}
