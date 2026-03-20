package com.care.global.external.privy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

/**
 * Privy Pregenerate Embedded Wallet API
 * 참고 : https://docs.privy.io/guide/server/wallets/new-user
 */

@Slf4j
@Service
public class PrivyWalletService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${privy.app-id:}")
    private String appId;

    @Value("${privy.app-secret:}")
    private String appSecret;

    // https://docs.privy.io/api-reference/users/create
    // 앱 유저를 만들면서  pre-generate embedded wallet을 같이 만드는 방식
    private static final String PRIVY_USERS_URL = "https://auth.privy.io/api/v1/users";

    public PrivyWalletService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 회원가입 시 Privy 임베디드 지갑 자동 생성
     * @return [walletAddress, privyUserId] — 실패 시 [null, null]
     */
    public String[] createWalletForUser(String email) {
        log.info("[Privy] createWalletForUser - email: {}", email);

        if (appId == null || appId.isBlank()) {
            return new String[]{null, null};
        }

        try {
            HttpHeaders headers = buildHeaders();
            Map<String, Object> body = Map.of(
                    "create_ethereum_wallet", true,
                    "linked_accounts", new Object[]{
                            Map.of("address", email, "type", "email")
                    }
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    PRIVY_USERS_URL, request, String.class);

            log.info("[Privy] 응답 status: {}, body: {}", response.getStatusCode(), response.getBody());

            JsonNode root = objectMapper.readTree(response.getBody());
            String privyUserId = root.path("id").asText();
            JsonNode linkedAccounts = root.path("linked_accounts");

            for (JsonNode account : linkedAccounts) {
                String type = account.path("type").asText();
                String walletClient = account.path("walletClient").asText();
                // 응답 : type=wallet, walletClient=privy
                if ("wallet".equals(type) && "privy".equals(walletClient)) {
                    String walletAddress = account.path("address").asText();
                    log.info("[Privy] 지갑 생성 완료 - address: {}, userId: {}", walletAddress, privyUserId);
                    return new String[]{walletAddress, privyUserId};
                }
            }

            log.warn("[Privy] 응답에 지갑이 존재 X - body: {}", response.getBody());

        } catch (Exception e) {
            log.error("[Privy] 지갑 생성 실패: {}", e.getMessage(), e);
        }

        return new String[]{null, null};
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("privy-app-id", appId);
        headers.set("User-Agent", "CareApp/1.0");
        // Basic Auth: Base64(appId:appSecret)
        String credentials = Base64.getEncoder()
                .encodeToString((appId + ":" + appSecret).getBytes());
        headers.set("Authorization", "Basic " + credentials);
        return headers;
    }
}
