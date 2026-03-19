package com.care.domain.reservation.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "dispute")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Dispute extends BaseEntity {

    @Id
    @Column(name = "dispute_id", length = 100)
    private String disputeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    // 업체가 문제 삼은 반납 후 흠집 기록
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_log_id", nullable = false)
    private Scratch targetScratch;

    // 고객이 방어 시 제출한 대여 전 흠집 기록 (방어 전까지 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "defense_log_id")
    private Scratch defenseScratch;

    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "claim_amount", nullable = false)
    private int claimAmount;

    public static Dispute create(Reservation reservation,
                                 Scratch targetScratch,
                                 String reason,
                                 int claimAmount) {
        if (reservation == null) {
            throw new IllegalArgumentException("reservation은 필수입니다.");
        }
        if (targetScratch == null) {
            throw new IllegalArgumentException("targetScratch는 필수입니다.");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("분쟁 사유는 필수입니다.");
        }
        if (claimAmount <= 0) {
            throw new IllegalArgumentException("청구 금액은 0보다 커야 합니다.");
        }

        Dispute dispute = new Dispute();
        dispute.disputeId = UUID.randomUUID().toString();
        dispute.reservation = reservation;
        dispute.targetScratch = targetScratch;
        dispute.reason = reason;
        dispute.claimAmount = claimAmount;
        dispute.setStatus(DisputeStatus.OPEN);
        return dispute;
    }

    public DisputeStatus getStatusEnum() {
        return DisputeStatus.from(this.status);
    }

    public void setStatus(DisputeStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("분쟁 상태는 필수입니다.");
        }
        this.status = status.name();
    }

    public void defend(Scratch defenseScratch) {
        if (defenseScratch == null) {
            throw new IllegalArgumentException("defenseScratch는 필수입니다.");
        }
        assertStatus(DisputeStatus.OPEN);

        this.defenseScratch = defenseScratch;
        setStatus(DisputeStatus.DEFENDED);
    }

    public void resolve() {
        DisputeStatus current = getStatusEnum();
        if (current != DisputeStatus.OPEN && current != DisputeStatus.DEFENDED) {
            throw new IllegalStateException("현재 상태에서는 해결 처리할 수 없습니다: " + current.name());
        }
        setStatus(DisputeStatus.RESOLVED);
    }

    private void assertStatus(DisputeStatus expected) {
        DisputeStatus current = getStatusEnum();
        if (current != expected) {
            throw new IllegalStateException(
                    "분쟁 상태가 올바르지 않습니다. expected=" + expected.name() + ", current=" + current.name());
        }
    }
}
