package com.care.global.external.nts;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * 국세청 사업자등록 진위확인 API 클라이언트
 * API KEY 미설정 시 Mock(true) 반환 -> 자격 제한 없는 api라 발급 후 .env에 설정 가능
 * valid: "01" → 일치, "02" → 불일치
 */

@Component
@RequiredArgsConstructor
public class NtsVerifyClient {

    private final RestTemplate restTemplate;

    @Value("${nts.api-key:}")
    private String apiKey;

    private static final String URL = "https://api.odcloud.kr/api/nts-businessman/v1/validate";

    public boolean verifyBusiness(String bizNo, String startDt, String representativeName) {
        if (apiKey == null || apiKey.isBlank()) return mockResult();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> business = Map.of(
                    "b_no", bizNo,
                    "start_dt", startDt,
                    "p_nm", representativeName
            );

            Map<String, Object> body = Map.of("businesses", List.of(business));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            String url = URL + "?serviceKey=" + apiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<?, ?>> data = (List<Map<?, ?>>) response.getBody().get("data");
                if (data != null && !data.isEmpty()) {
                    return "01".equals(data.get(0).get("valid"));
                }
            }
        } catch (Exception e) {
            // API 호출 실패 시 false
        }
        return false;
    }

    private boolean mockResult() {
        return true;
    }
}
