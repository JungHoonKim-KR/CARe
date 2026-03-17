package com.care.domain.reservation.entity;

import com.care.domain.car.entity.OwnedCar;
import com.care.domain.company.entity.Insurance;
import com.care.domain.member.entity.Renter;
import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reservation")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseEntity {

    @Id
    @Column(name = "reservation_id", length = 100)
    private String reservationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Renter renter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private OwnedCar ownedCar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_id", nullable = false)
    private Insurance insurance;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "smart_contract_address", length = 100, nullable = false)
    private String smartContractAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_status")
    private DepositStatus depositStatus;

    @Column(name = "before_scan_tx_hash", length = 100)
    private String beforeScanTxHash;

    @Column(name = "after_scan_tx_hash", length = 100)
    private String afterScanTxHash;

    public enum DepositStatus {
        SAFE, LOCKED, DEDUCTED
    }
}
