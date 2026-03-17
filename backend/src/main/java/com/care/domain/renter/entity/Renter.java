package com.care.domain.renter.entity;

import com.care.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "renter")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Renter extends BaseEntity {

    @Id
    @Column(name = "user_id", length = 100)
    private String userId;

    @Column(name = "name", length = 25, nullable = false)
    private String name;

    @Column(name = "email", length = 100, nullable = false)
    private String email;

    @Column(name = "did_uri", length = 100, nullable = false)
    private String didUri;

    @Column(name = "wallet_address", length = 100, nullable = false)
    private String walletAddress;

    @Column(name = "language_code", length = 10, nullable = false)
    private String languageCode;

}
