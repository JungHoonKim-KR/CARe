package com.care.global.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiScratchSimilarityClient {

    // WebConfig에서 등록한 공용 HTTP 클라이언트 빈
    private final RestTemplate restTemplate;

    // 흠집 유사도 비교 엔드포인트를 제공하는 FastAPI 서버의 기본 URL
    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServerUrl;

    /**
     * 두 개의 crop URL로 AI 비교 API를 호출하고,
     * JSON 응답을 타입이 있는 결과 객체로 변환
     */
    public AiScratchSimilarityResult compareByUrls(String refCropS3Url, String targetCropS3Url) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of(
                "ref_crop_s3_url", refCropS3Url,
                "target_crop_s3_url", targetCropS3Url
        );

        Map response = restTemplate.postForObject(
                aiServerUrl + "/api/v1/scratches/compare",
                new HttpEntity<>(body, headers),
                Map.class
        );

        if (response == null) {
            throw new IllegalStateException("AI 비교 응답이 비어 있습니다.");
        }

        double similarity = toDouble(response.get("similarity"));
        double diffScore = toDouble(response.get("diff_score"));
        log.info("[AI Similarity] similarity={}, diffScore={}", similarity, diffScore);

        return new AiScratchSimilarityResult(similarity, diffScore);
    }

    // 원격 JSON 숫자값이 Number/String 형태로 올 수 있어 방어적으로 변환
    private double toDouble(Object value) {
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        if (value == null) {
            return 0.0;
        }
        return Double.parseDouble(value.toString());
    }
}
