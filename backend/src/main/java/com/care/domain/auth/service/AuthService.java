package com.care.domain.auth.service;

import com.care.domain.auth.controller.dto.request.CompanySignUpRequest;
import com.care.domain.auth.controller.dto.request.LoginRequest;
import com.care.domain.auth.controller.dto.request.RenterSignUpRequest;
import com.care.domain.auth.controller.dto.response.TokenResponse;
import com.care.domain.company.entity.Company;
import com.care.domain.company.repository.CompanyRepository;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.repository.RenterRepository;
import com.care.global.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RenterRepository renterRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    // 임대인 회원가입
    @Transactional
    public void renterSignUp(RenterSignUpRequest request) {
        if (renterRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("등록된 이메일입니다.");
        }
        Renter renter = Renter.of(
                UUID.randomUUID().toString(),
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getLanguageCode(),
                request.getWalletAddress()
        );
        if (request.getPrivyWalletId() != null) {
            renter.updatePrivyWallet(request.getWalletAddress(), request.getPrivyWalletId());
        }
        renterRepository.save(renter);
    }

    // 임차인 회원가입
    @Transactional
    public void companySignUp(CompanySignUpRequest request) {
        if (companyRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        Company company = Company.of(
                UUID.randomUUID().toString(),
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getAirportCode(),
                request.getLanguageCode(),
                request.getWalletAddress()
        );
        if (request.getPrivyWalletId() != null) {
            company.updatePrivyWallet(request.getWalletAddress(), request.getPrivyWalletId());
        }
        companyRepository.save(company);
    }

    // 임대인 로그인
    @Transactional(readOnly = true)
    public TokenResponse renterLogin(LoginRequest request) {
        Renter renter = renterRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), renter.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return issueTokens(renter.getUserId(), "RENTER");
    }

    // 임차인 로그인
    @Transactional(readOnly = true)
    public TokenResponse companyLogin(LoginRequest request) {
        Company company = companyRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), company.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return issueTokens(company.getCompanyId(), "COMPANY");
    }

    // 토큰 생성
    private TokenResponse issueTokens(String userId, String role) {
        String accessToken = jwtUtil.generateAccessToken(userId, role);
        String refreshToken = jwtUtil.generateRefreshToken(userId, role);

        String jti = jwtUtil.getJti(refreshToken);
        redisTemplate.opsForValue().set("refresh:" + userId, jti, Duration.ofDays(7));

        return new TokenResponse(accessToken, refreshToken);
    }

    // 토큰 갱신
    public TokenResponse refresh(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        String userId = jwtUtil.getUserId(refreshToken);
        String role = jwtUtil.parseClaims(refreshToken).get("role", String.class);
        String jti = jwtUtil.getJti(refreshToken);

        String stored = redisTemplate.opsForValue().get("refresh:" + userId);
        if (!jti.equals(stored)) {
            throw new IllegalArgumentException("이미 사용된 리프레시 토큰입니다.");
        }

        return issueTokens(userId, role);
    }

    // 로그아웃
    public void logout(String accessToken, String userId) {
        String jti = jwtUtil.getJti(accessToken);
        long expiration = jwtUtil.getExpiration(accessToken) - System.currentTimeMillis();
        redisTemplate.opsForValue().set("blacklist:" + jti, "true", expiration, TimeUnit.MILLISECONDS);
        redisTemplate.delete("refresh:" + userId);
    }
}
