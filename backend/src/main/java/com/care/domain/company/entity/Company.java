package com.care.domain.company.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Company extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 100)
    private String companyId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "did_uri", length = 100, nullable = false)
    private String didUri;

    @Column(name = "wallet_address", length = 100, nullable = false)
    private String walletAddress;

    @Column(name = "country_code", length = 2, nullable = false)
    private String countryCode;

    @Column(name = "city", length = 50, nullable = false)
    private String city;

    @Column(name = "airport_code", length = 10, nullable = false)
    private String airportCode;

    @Column(name = "detail_address", length = 255, nullable = false)
    private String detailAddress;

    @Column(name = "language_code", length = 10, nullable = false)
    private String languageCode;

}
