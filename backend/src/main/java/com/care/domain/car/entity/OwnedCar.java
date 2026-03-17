package com.care.domain.car.entity;

import com.care.domain.company.entity.Company;
import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "owned_car")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OwnedCar extends BaseEntity {

    @Id
    @Column(name = "car_id", length = 100)
    private String carId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private CarModel carModel;

    @Column(name = "plate_number", length = 100, nullable = false)
    private String plateNumber;

    @Column(name = "nft_token_id", length = 100, nullable = false)
    private String nftTokenId;

}
