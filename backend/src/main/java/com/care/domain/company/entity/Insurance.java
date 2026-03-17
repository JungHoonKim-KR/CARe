package com.care.domain.company.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "insurance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Insurance extends BaseEntity {

    @Id
    @Column(name = "insurance_id", length = 100)
    private String insuranceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "price", nullable = false)
    private int price;

}
