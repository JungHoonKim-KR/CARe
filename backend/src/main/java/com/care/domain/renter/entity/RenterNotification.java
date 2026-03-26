package com.care.domain.renter.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "renter_notification")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RenterNotification extends BaseEntity {

    private static final String DISPUTE_CREATED_TYPE = "DISPUTE_CREATED";
    private static final String DISPUTE_CREATED_TITLE = "분쟁이 접수되었습니다.";
    private static final String SETTLEMENT_REQUESTED_TYPE = "SETTLEMENT_REQUESTED";
    private static final String SETTLEMENT_COMPLETED_TYPE = "SETTLEMENT_COMPLETED";

    @Id
    @Column(name = "notification_id", length = 100)
    private String notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", referencedColumnName = "user_id", nullable = false)
    private Renter renter;

    @Column(name = "notification_type", length = 50, nullable = false)
    private String notificationType;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "dispute_id", length = 100)
    private String disputeId;

    @Column(name = "reservation_id", length = 100)
    private String reservationId;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public static RenterNotification disputeCreated(Renter renter,
                                                    String reservationId,
                                                    String disputeId,
                                                    String reason) {
        if (renter == null) {
            throw new IllegalArgumentException("renter는 필수입니다.");
        }
        if (reservationId == null || reservationId.isBlank()) {
            throw new IllegalArgumentException("reservationId는 필수입니다.");
        }
        if (disputeId == null || disputeId.isBlank()) {
            throw new IllegalArgumentException("disputeId는 필수입니다.");
        }

        RenterNotification notification = new RenterNotification();
        notification.notificationId = UUID.randomUUID().toString();
        notification.renter = renter;
        notification.notificationType = DISPUTE_CREATED_TYPE;
        notification.title = DISPUTE_CREATED_TITLE;
        notification.message = buildDisputeCreatedMessage(reservationId, reason);
        notification.disputeId = disputeId;
        notification.reservationId = reservationId;
        notification.read = false;
        notification.readAt = null;
        return notification;
    }

    public static RenterNotification settlementRequested(Renter renter,
                                                         String reservationId,
                                                         String disputeId,
                                                         long finalAmount) {
        if (renter == null) {
            throw new IllegalArgumentException("renter는 필수입니다.");
        }
        if (reservationId == null || reservationId.isBlank()) {
            throw new IllegalArgumentException("reservationId는 필수입니다.");
        }
        if (disputeId == null || disputeId.isBlank()) {
            throw new IllegalArgumentException("disputeId는 필수입니다.");
        }

        RenterNotification notification = new RenterNotification();
        notification.notificationId = UUID.randomUUID().toString();
        notification.renter = renter;
        notification.notificationType = SETTLEMENT_REQUESTED_TYPE;
        notification.title = "업체가 정산에 동의했습니다.";
        notification.message = "예약 " + reservationId + " 분쟁 정산 금액 " + finalAmount
                + "원에 업체 동의가 완료되었습니다. 최종 동의 여부를 확인해주세요.";
        notification.disputeId = disputeId;
        notification.reservationId = reservationId;
        notification.read = false;
        notification.readAt = null;
        return notification;
    }

    public static RenterNotification settlementCompleted(Renter renter,
                                                         String reservationId,
                                                         String disputeId,
                                                         String settlementStatus,
                                                         long finalAmount) {
        if (renter == null) {
            throw new IllegalArgumentException("renter는 필수입니다.");
        }
        if (reservationId == null || reservationId.isBlank()) {
            throw new IllegalArgumentException("reservationId는 필수입니다.");
        }
        if (disputeId == null || disputeId.isBlank()) {
            throw new IllegalArgumentException("disputeId는 필수입니다.");
        }

        RenterNotification notification = new RenterNotification();
        notification.notificationId = UUID.randomUUID().toString();
        notification.renter = renter;
        notification.notificationType = SETTLEMENT_COMPLETED_TYPE;
        notification.title = "분쟁 정산이 완료되었습니다.";
        notification.message = "예약 " + reservationId + " 분쟁 정산이 완료되었습니다. 상태: "
                + settlementStatus + ", 금액: " + finalAmount + "원";
        notification.disputeId = disputeId;
        notification.reservationId = reservationId;
        notification.read = false;
        notification.readAt = null;
        return notification;
    }

    public void markAsRead() {
        if (this.read) {
            return;
        }
        this.read = true;
        this.readAt = LocalDateTime.now();
    }

    private static String buildDisputeCreatedMessage(String reservationId, String reason) {
        if (reason == null || reason.isBlank()) {
            return "예약 " + reservationId + "에서 새로운 분쟁이 접수되었습니다.";
        }
        return "예약 " + reservationId + "에서 새로운 분쟁이 접수되었습니다. 사유: " + reason;
    }
}
