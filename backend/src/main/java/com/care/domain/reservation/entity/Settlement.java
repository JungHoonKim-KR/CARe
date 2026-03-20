package com.care.domain.reservation.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "settlement")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Settlement extends BaseEntity {

    @Id
    @Column(name = "settlement_id", length = 100)
    private String settlementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(name = "final_amount", nullable = false)
    private long finalAmount;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "tx_hash", length = 100)
    private String txHash;

    public static Settlement createPending(Reservation reservation) {
        if (reservation == null) {
            throw new IllegalArgumentException("reservation은 필수입니다.");
        }

        Settlement settlement = new Settlement();
        settlement.settlementId = UUID.randomUUID().toString();
        settlement.reservation = reservation;
        settlement.finalAmount = 0L;
        settlement.status = SettlementStatus.PENDING.name();
        return settlement;
    }

    public SettlementStatus getStatusEnum() {
        return SettlementStatus.from(this.status);
    }

    public void complete(long finalAmount, String txHash, SettlementStatus status) {
        if (finalAmount < 0) {
            throw new IllegalArgumentException("finalAmount는 0 이상이어야 합니다.");
        }
        if (txHash == null || txHash.isBlank()) {
            throw new IllegalArgumentException("txHash는 필수입니다.");
        }
        if (status != SettlementStatus.COMPLETED && status != SettlementStatus.REFUNDED) {
            throw new IllegalArgumentException("정산 완료 상태는 COMPLETED 또는 REFUNDED만 가능합니다.");
        }

        this.finalAmount = finalAmount;
        this.txHash = txHash;
        this.status = status.name();
        this.settledAt = LocalDateTime.now();
    }
}