package com.care.domain.car.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_model")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CarModel extends BaseEntity {

    @Id
    @Column(name = "model_id", length = 100)
    private String modelId;

    @Column(name = "brand", length = 50, nullable = false)
    private String brand;

    @Column(name = "model_name", length = 100, nullable = false)
    private String modelName;

    @Column(name = "fuel_type", length = 20, nullable = false)
    private String fuelType;

}
