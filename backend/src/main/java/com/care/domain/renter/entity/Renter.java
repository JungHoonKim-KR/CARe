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

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "wallet_address", length = 100, unique = true)
    private String walletAddress;

    @Column(name = "did_uri", length = 100)
    private String didUri;

    @Column(name = "did_verified", nullable = false)
    private boolean didVerified = false;

    @Column(name = "language_code", length = 10)
    private String languageCode;

}
