package com.care.domain.renter.service;

import com.care.domain.renter.controller.dto.response.TokenChargeResponse;
import com.care.domain.renter.entity.Renter;
import com.care.domain.renter.exception.RenterErrorCode;
import com.care.domain.renter.repository.RenterRepository;
import com.care.global.blockchain.CareTokenService;
import com.care.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class RenterTokenService {

    private final RenterRepository renterRepository;
    private final CareTokenService careTokenService;

    /**
     * CARE 토큰 충전
     * faucet(walletAddress, amount) 호출 후 잔액 조회
     */
    public TokenChargeResponse charge(String userId, double amount) {
        Renter renter = renterRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(RenterErrorCode.RENTER_NOT_FOUND));

        String walletAddress = renter.getWalletAddress();
        if (walletAddress == null || walletAddress.isBlank()) {
            throw new BusinessException(RenterErrorCode.WALLET_NOT_REGISTERED);
        }

        try {
            String txHash = careTokenService.faucet(walletAddress, amount);
            log.info("[RenterToken] 충전 완료 | userId: {}, amount: {} CARE, txHash: {}", userId, amount, txHash);

            BigInteger rawBalance = careTokenService.balanceOf(walletAddress);
            String balance = new BigDecimal(rawBalance)
                    .movePointLeft(6)
                    .stripTrailingZeros()
                    .toPlainString();

            return new TokenChargeResponse(walletAddress, amount, txHash, balance);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("[RenterToken] 충전 실패 | userId: {}, error: {}", userId, e.getMessage());
            throw new BusinessException(RenterErrorCode.TOKEN_CHARGE_FAILED);
        }
    }

    /**
     * CARE 토큰 잔액 조회
     */
    public String getBalance(String userId) {
        Renter renter = renterRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(RenterErrorCode.RENTER_NOT_FOUND));

        String walletAddress = renter.getWalletAddress();
        if (walletAddress == null || walletAddress.isBlank()) {
            throw new BusinessException(RenterErrorCode.WALLET_NOT_REGISTERED);
        }

        try {
            BigInteger rawBalance = careTokenService.balanceOf(walletAddress);
            return new BigDecimal(rawBalance)
                    .movePointLeft(6)
                    .stripTrailingZeros()
                    .toPlainString();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("[RenterToken] 잔액 조회 실패 | userId: {}, error: {}", userId, e.getMessage());
            throw new BusinessException(RenterErrorCode.TOKEN_BALANCE_FAILED);
        }
    }
}
