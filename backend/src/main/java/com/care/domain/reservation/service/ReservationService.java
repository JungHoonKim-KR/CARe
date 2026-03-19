package com.care.domain.reservation.service;

import com.care.domain.reservation.controller.dto.response.ReservationDetailResponse;
import com.care.domain.reservation.controller.dto.response.ReservationSummaryResponse;
import com.care.domain.reservation.exception.ReservationErrorCode;
import com.care.domain.reservation.repository.ReservationRepository;
import com.care.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<ReservationSummaryResponse> getRenterReservations(String renterId) {
        return reservationRepository.findByRenterUserId(renterId).stream()
                .map(ReservationSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationSummaryResponse> getCompanyReservations(String companyId) {
        return reservationRepository.findByOwnedCarCompanyCompanyId(companyId).stream()
                .map(ReservationSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReservationDetailResponse getReservationDetail(String reservationId) {
        return reservationRepository.findByReservationId(reservationId)
                .map(ReservationDetailResponse::from)
                .orElseThrow(() -> new BusinessException(ReservationErrorCode.RESERVATION_NOT_FOUND));
    }
}
