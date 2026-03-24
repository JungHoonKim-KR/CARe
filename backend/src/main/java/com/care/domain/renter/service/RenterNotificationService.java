package com.care.domain.renter.service;

import com.care.domain.renter.controller.dto.response.RenterNotificationResponse;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.entity.RenterNotification;
import com.care.domain.renter.repository.RenterNotificationRepository;
import com.care.domain.reservation.entity.Dispute;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RenterNotificationService {

    private final RenterNotificationRepository renterNotificationRepository;

    @Transactional
    public void createDisputeCreatedNotification(Renter renter, Dispute dispute) {
        if (renter == null) {
            throw new IllegalArgumentException("렌터 정보가 없습니다.");
        }
        if (dispute == null) {
            throw new IllegalArgumentException("분쟁 정보가 없습니다.");
        }

        RenterNotification notification = RenterNotification.disputeCreated(
                renter,
                dispute.getReservation().getReservationId(),
                dispute.getDisputeId(),
                dispute.getReason()
        );
        renterNotificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<RenterNotificationResponse> getMyNotifications(String userId) {
        return renterNotificationRepository.findByRenter_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(RenterNotificationResponse::from)
                .toList();
    }

    @Transactional
    public RenterNotificationResponse markAsRead(String userId, String notificationId) {
        RenterNotification notification = renterNotificationRepository
                .findByNotificationIdAndRenter_UserId(notificationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다: " + notificationId));

        notification.markAsRead();
        return RenterNotificationResponse.from(notification);
    }
}
