package com.care.domain.reservation.service;

import com.care.domain.reservation.controller.dto.response.SmartKeyResponse;
import com.care.domain.reservation.entity.Reservation;
import com.care.domain.reservation.entity.SmartKey;
import com.care.domain.reservation.repository.ReservationRepository;
import com.care.domain.reservation.repository.SmartKeyRepository;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.repository.RenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SmartKeyService {

    private final SmartKeyRepository smartKeyRepository;
    private final ReservationRepository reservationRepository;
    private final RenterRepository renterRepository;

    /**
     * 스마트키 발급
     * 조건: did_verified = true
     */
    @Transactional
    public SmartKeyResponse issueSmartKey(String userId, String reservationId) {
        Renter renter = renterRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!renter.isDidVerified()) {
            throw new IllegalStateException("신원 인증이 완료되지 않았습니다. 여권 및 면허증 인증을 먼저 완료해주세요.");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 예약입니다."));

        // 이미 발급된 스마트키가 있으면 반환
        return smartKeyRepository.findByReservation_ReservationId(reservationId)
                .map(SmartKeyResponse::new)
                .orElseGet(() -> {
                    String token = UUID.randomUUID().toString().replace("-", "");
                    LocalDateTime expiresAt = reservation.getReturnDate();
                    SmartKey key = SmartKey.issue(
                            UUID.randomUUID().toString(),
                            reservation,
                            token,
                            expiresAt
                    );
                    return new SmartKeyResponse(smartKeyRepository.save(key));
                });
    }

    /**
     * 잠금 해제
     */
    @Transactional
    public SmartKeyResponse unlock(String userId, String reservationId) {
        SmartKey key = getValidKey(reservationId);
        key.unlock();
        return new SmartKeyResponse(key);
    }

    /**
     * 잠금 설정
     */
    @Transactional
    public SmartKeyResponse lock(String userId, String reservationId) {
        SmartKey key = getValidKey(reservationId);
        key.lock();
        return new SmartKeyResponse(key);
    }

    /**
     * 스마트키 상태 조회
     */
    @Transactional(readOnly = true)
    public SmartKeyResponse getStatus(String reservationId) {
        SmartKey key = smartKeyRepository.findByReservation_ReservationId(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("발급된 스마트키가 없습니다."));
        return new SmartKeyResponse(key);
    }

    /**
     * 스마트키 회수 (반납 시)
     */
    @Transactional
    public void revokeSmartKey(String reservationId) {
        smartKeyRepository.findByReservation_ReservationId(reservationId)
                .ifPresent(SmartKey::revoke);
    }

    private SmartKey getValidKey(String reservationId) {
        SmartKey key = smartKeyRepository.findByReservation_ReservationId(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("발급된 스마트키가 없습니다."));
        if (!key.isActive()) throw new IllegalStateException("회수된 스마트키입니다.");
        if (key.isExpired()) throw new IllegalStateException("만료된 스마트키입니다.");
        return key;
    }
}
