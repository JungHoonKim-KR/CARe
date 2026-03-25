package com.care.domain.reservation.service;

import com.care.domain.car.entity.OwnedCar;
import com.care.domain.car.repository.OwnedCarRepository;
import com.care.domain.company.entity.Company;
import com.care.domain.company.entity.Insurance;
import com.care.domain.company.repository.InsuranceRepository;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.repository.RenterRepository;
import com.care.domain.reservation.controller.dto.request.ReservationCreateRequest;
import com.care.domain.reservation.controller.dto.response.ReservationCreateResponse;
import com.care.domain.reservation.controller.dto.response.ReservationDetailResponse;
import com.care.domain.reservation.controller.dto.response.ReservationReturnResponse;
import com.care.domain.reservation.controller.dto.response.ReservationSummaryResponse;
import com.care.domain.reservation.entity.Reservation;
import com.care.domain.reservation.exception.ReservationErrorCode;
import com.care.domain.reservation.repository.ReservationRepository;
import com.care.domain.scan.repository.ScratchRepository;
import com.care.global.blockchain.CareTokenService;
import com.care.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final OwnedCarRepository ownedCarRepository;
    private final InsuranceRepository insuranceRepository;
    private final RenterRepository renterRepository;
    private final ScratchRepository scratchRepository;
    private final CareTokenService careTokenService;

    @Transactional
    public ReservationCreateResponse createReservation(String userId, ReservationCreateRequest request) {
        Renter renter = renterRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ReservationErrorCode.WALLET_NOT_REGISTERED));

        OwnedCar car = ownedCarRepository.findById(request.carId())
                .orElseThrow(() -> new BusinessException(ReservationErrorCode.CAR_NOT_FOUND));

        Insurance insurance = insuranceRepository.findById(request.insuranceId())
                .orElseThrow(() -> new BusinessException(ReservationErrorCode.INSURANCE_NOT_FOUND));

        String renterWallet = renter.getWalletAddress();
        Company company = car.getCompany();
        String companyWallet = company.getWalletAddress();

        if (renterWallet == null || renterWallet.isBlank()) {
            throw new BusinessException(ReservationErrorCode.WALLET_NOT_REGISTERED);
        }
        if (companyWallet == null || companyWallet.isBlank()) {
            throw new BusinessException(ReservationErrorCode.WALLET_NOT_REGISTERED);
        }

        // totalPrice 서버 계산: 대여일수 × 차량일일요금 + 보험료
        long days = ChronoUnit.DAYS.between(request.pickupDate(), request.returnDate());
        if (days < 1) {
            throw new BusinessException(ReservationErrorCode.INVALID_DATE);
        }
        int totalPrice = (int) (days * car.getDailyPrice()) + insurance.getPrice();

        // 블록체인 결제
        String txHash;
        try {
            txHash = careTokenService.transfer(renterWallet, companyWallet, totalPrice);
        } catch (Exception e) {
            log.error("[Reservation] 결제 실패 | renter={}, company={}, amount={}, error={}",
                    userId, company.getCompanyId(), totalPrice, e.getMessage());
            throw new BusinessException(ReservationErrorCode.PAYMENT_FAILED);
        }

        Reservation reservation = Reservation.create(renter, car, insurance,
                request.pickupDate(), request.returnDate(), totalPrice, txHash);
        reservationRepository.save(reservation);

        log.info("[Reservation] 예약 생성 | id={}, renter={}, car={}, price={}, txHash={}",
                reservation.getReservationId(), userId, request.carId(), totalPrice, txHash);

        return ReservationCreateResponse.from(reservation);
    }

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

    @Transactional
    public ReservationReturnResponse completeReservation(String userId, String reservationId) {
        Reservation reservation = reservationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BusinessException(ReservationErrorCode.RESERVATION_NOT_FOUND));

        if (!reservation.getRenter().getUserId().equals(userId)) {
            throw new BusinessException(ReservationErrorCode.RESERVATION_ACCESS_DENIED);
        }

        String status = reservation.getStatus();
        if ("COMPLETED".equals(status)) {
            throw new BusinessException(ReservationErrorCode.INVALID_RETURN_STATUS);
        }

        int beforeScratchCount = scratchRepository
                .findByReservation_ReservationIdAndLogType(reservationId, "BEFORE")
                .size();
        int afterScratchCount = scratchRepository
                .findByReservation_ReservationIdAndLogType(reservationId, "AFTER")
                .size();

        if (!"COMPLETED".equals(status)) {
            reservation.updateStatusToCompleted();
        }

        return ReservationReturnResponse.of(
                reservationId,
                reservation.getStatus(),
                beforeScratchCount,
                afterScratchCount,
                java.time.LocalDateTime.now()
        );
    }
}
