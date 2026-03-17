package com.care.domain.reservation.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

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
}
