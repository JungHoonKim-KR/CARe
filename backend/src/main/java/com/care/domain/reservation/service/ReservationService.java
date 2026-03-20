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
import com.care.domain.reservation.controller.dto.response.ReservationSummaryResponse;
import com.care.domain.reservation.entity.Reservation;
import com.care.domain.reservation.exception.ReservationErrorCode;
import com.care.domain.reservation.repository.ReservationRepository;
import com.care.global.blockchain.CareTokenService;
import com.care.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final OwnedCarRepository ownedCarRepository;
    private final InsuranceRepository insuranceRepository;
    private final RenterRepository renterRepository;
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

        // 블록체인 결제
        String txHash;
        try {
            txHash = careTokenService.transfer(renterWallet, companyWallet, request.totalPrice());
        } catch (Exception e) {
            log.error("[Reservation] 결제 실패 | renter={}, company={}, amount={}, error={}",
                    userId, company.getCompanyId(), request.totalPrice(), e.getMessage());
            throw new BusinessException(ReservationErrorCode.PAYMENT_FAILED);
        }

        Reservation reservation = Reservation.create(renter, car, insurance, request.pickupDate(), request.returnDate(),request.totalPrice(),  txHash);
        reservationRepository.save(reservation);

        log.info("[Reservation] 예약 생성 | id={}, renter={}, car={}, pickup={}, return={}, price={}, txHash={}",
                reservation.getReservationId(), userId, request.carId(), request.pickupDate(), request.returnDate(), request.totalPrice(), txHash);

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
}
