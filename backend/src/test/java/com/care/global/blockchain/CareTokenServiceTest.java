package com.care.global.blockchain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CareTokenServiceTest {

    @Autowired
    CareTokenService careTokenService;

    private static final String TEST_ADDRESS = "0x3c6A8116E04dba741aC1BA23e957fC5ce7fD7dbb";

    @Test
    @DisplayName("balanceOf - 잔액 조회")
    void balanceOf() throws Exception {
        BigInteger balance = careTokenService.balanceOf(TEST_ADDRESS);
        System.out.println("잔액: " + balance + " (micro CARE)");
        assertThat(balance).isGreaterThanOrEqualTo(BigInteger.ZERO);
    }

    @Test
    @DisplayName("faucet - 1 CARE 충전 후 잔액 증가 확인")
    void faucet() throws Exception {
        BigInteger before = careTokenService.balanceOf(TEST_ADDRESS);

        String txHash = careTokenService.faucet(TEST_ADDRESS, 1.0);
        System.out.println("txHash: " + txHash);
        assertThat(txHash).isNotNull().startsWith("0x");

        // 트랜잭션 반영 대기 (SSAFY 체인 블록 생성 대기)
        Thread.sleep(10000);

        BigInteger after = careTokenService.balanceOf(TEST_ADDRESS);
        System.out.println("충전 전: " + before + " / 충전 후: " + after);
        assertThat(after).isGreaterThan(before);
    }
}
