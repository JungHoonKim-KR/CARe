package com.care.domain.renter.service;

import com.care.domain.renter.controller.dto.response.RenterNotificationResponse;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.entity.RenterNotification;
import com.care.domain.renter.repository.RenterNotificationRepository;
import com.care.domain.reservation.entity.Dispute;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
public class RenterNotificationService {

    private static final long SSE_TIMEOUT_MILLIS = 60L * 60L * 1000L;

    private final RenterNotificationRepository renterNotificationRepository;
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emitterStore = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MILLIS);
        CopyOnWriteArrayList<SseEmitter> emitters = emitterStore.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> {
            removeEmitter(userId, emitter);
            emitter.complete();
        });
        emitter.onError(throwable -> {
            removeEmitter(userId, emitter);
            emitter.completeWithError(throwable);
        });

        sendEvent(userId, emitter, "CONNECTED", Map.of("message", "notification stream connected"));
        return emitter;
    }

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
            RenterNotification saved = renterNotificationRepository.save(notification);
            pushNotification(renter.getUserId(), RenterNotificationResponse.from(saved));
    }

    @Transactional
    public void createSettlementRequestedNotification(Renter renter, Dispute dispute, long finalAmount) {
        if (renter == null) {
            throw new IllegalArgumentException("렌터 정보가 없습니다.");
        }
        if (dispute == null) {
            throw new IllegalArgumentException("분쟁 정보가 없습니다.");
        }

        RenterNotification notification = RenterNotification.settlementRequested(
                renter,
                dispute.getReservation().getReservationId(),
                dispute.getDisputeId(),
                finalAmount
        );
        RenterNotification saved = renterNotificationRepository.save(notification);
        pushNotification(renter.getUserId(), RenterNotificationResponse.from(saved));
    }

    @Transactional
    public void createSettlementCompletedNotification(
            Renter renter,
            Dispute dispute,
            String settlementStatus,
            long finalAmount
    ) {
        if (renter == null) {
            throw new IllegalArgumentException("렌터 정보가 없습니다.");
        }
        if (dispute == null) {
            throw new IllegalArgumentException("분쟁 정보가 없습니다.");
        }

        RenterNotification notification = RenterNotification.settlementCompleted(
                renter,
                dispute.getReservation().getReservationId(),
                dispute.getDisputeId(),
                settlementStatus,
                finalAmount
        );
        RenterNotification saved = renterNotificationRepository.save(notification);
        pushNotification(renter.getUserId(), RenterNotificationResponse.from(saved));
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

    private void pushNotification(String userId, RenterNotificationResponse response) {
        List<SseEmitter> emitters = emitterStore.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : emitters) {
            sendEvent(userId, emitter, "NOTIFICATION", response);
        }
    }

    private void sendEvent(String userId, SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (IOException | IllegalStateException e) {
            removeEmitter(userId, emitter);
        }
    }

    private void removeEmitter(String userId, SseEmitter emitter) {
        List<SseEmitter> emitters = emitterStore.get(userId);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emitterStore.remove(userId);
        }
    }
}
