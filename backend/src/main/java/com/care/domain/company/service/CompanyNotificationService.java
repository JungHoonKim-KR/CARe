package com.care.domain.company.service;

import com.care.domain.company.controller.dto.response.CompanyNotificationResponse;
import com.care.domain.company.entity.Company;
import com.care.domain.company.entity.CompanyNotification;
import com.care.domain.company.repository.CompanyNotificationRepository;
import com.care.domain.reservation.entity.Dispute;
import com.care.domain.reservation.entity.Scratch;
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
public class CompanyNotificationService {

    private static final long SSE_TIMEOUT_MILLIS = 60L * 60L * 1000L;

    private final CompanyNotificationRepository companyNotificationRepository;
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emitterStore = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String companyId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MILLIS);
        CopyOnWriteArrayList<SseEmitter> emitters = emitterStore.computeIfAbsent(companyId, key -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(companyId, emitter));
        emitter.onTimeout(() -> {
            removeEmitter(companyId, emitter);
            emitter.complete();
        });
        emitter.onError(throwable -> {
            removeEmitter(companyId, emitter);
            emitter.completeWithError(throwable);
        });

        sendEvent(companyId, emitter, "CONNECTED", Map.of("message", "company notification stream connected"));
        return emitter;
    }

    @Transactional
    public void createDefenseSubmittedNotification(Company company, Dispute dispute, Scratch defenseScratch) {
        CompanyNotification notification = CompanyNotification.defenseSubmitted(company, dispute, defenseScratch);
        CompanyNotification saved = companyNotificationRepository.save(notification);
        pushNotification(company.getCompanyId(), CompanyNotificationResponse.from(saved));
    }

    @Transactional
    public void createSettlementRequestedNotification(Company company, Dispute dispute, long finalAmount) {
        CompanyNotification notification = CompanyNotification.settlementRequested(company, dispute, finalAmount);
        CompanyNotification saved = companyNotificationRepository.save(notification);
        pushNotification(company.getCompanyId(), CompanyNotificationResponse.from(saved));
    }

    @Transactional
    public void createSettlementCompletedNotification(
            Company company,
            Dispute dispute,
            String settlementStatus,
            long finalAmount
    ) {
        CompanyNotification notification = CompanyNotification
                .settlementCompleted(company, dispute, settlementStatus, finalAmount);
        CompanyNotification saved = companyNotificationRepository.save(notification);
        pushNotification(company.getCompanyId(), CompanyNotificationResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public List<CompanyNotificationResponse> getMyNotifications(String companyId) {
        return companyNotificationRepository.findByCompany_CompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(CompanyNotificationResponse::from)
                .toList();
    }

    @Transactional
    public CompanyNotificationResponse markAsRead(String companyId, String notificationId) {
        CompanyNotification notification = companyNotificationRepository
                .findByNotificationIdAndCompany_CompanyId(notificationId, companyId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다: " + notificationId));

        notification.markAsRead();
        return CompanyNotificationResponse.from(notification);
    }

    private void pushNotification(String companyId, CompanyNotificationResponse response) {
        List<SseEmitter> emitters = emitterStore.get(companyId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : emitters) {
            sendEvent(companyId, emitter, "NOTIFICATION", response);
        }
    }

    private void sendEvent(String companyId, SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (IOException | IllegalStateException e) {
            removeEmitter(companyId, emitter);
        }
    }

    private void removeEmitter(String companyId, SseEmitter emitter) {
        List<SseEmitter> emitters = emitterStore.get(companyId);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emitterStore.remove(companyId);
        }
    }
}
