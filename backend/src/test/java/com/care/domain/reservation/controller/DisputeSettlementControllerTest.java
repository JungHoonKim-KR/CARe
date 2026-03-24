package com.care.domain.reservation.controller;

import com.care.domain.reservation.controller.dto.response.DisputeAiAnalysisResponse;
import com.care.domain.reservation.service.DisputeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DisputeSettlementController.class)
@AutoConfigureMockMvc(addFilters = false)
class DisputeSettlementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DisputeService disputeService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    void 분쟁_AI_분석_API_성공() throws Exception {
        DisputeAiAnalysisResponse.ComparisonItem item = new DisputeAiAnalysisResponse.ComparisonItem(
                "before-log-1",
                "after-log-1",
                "https://example.com/before.jpg",
                "https://example.com/after.jpg",
                0.88,
                0.12
        );

        DisputeAiAnalysisResponse response = new DisputeAiAnalysisResponse(
                "dispute-1",
                "reservation-1",
                1,
                1,
                List.of(item)
        );

        given(disputeService.getDisputeAiAnalysis(nullable(String.class), anyString()))
                .willReturn(response);

        mockMvc.perform(get("/disputes/{disputeId}/ai-analysis", "dispute-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disputeId").value("dispute-1"))
                .andExpect(jsonPath("$.reservationId").value("reservation-1"))
                .andExpect(jsonPath("$.beforeCount").value(1))
                .andExpect(jsonPath("$.afterCount").value(1))
                .andExpect(jsonPath("$.comparisons[0].beforeLogId").value("before-log-1"))
                .andExpect(jsonPath("$.comparisons[0].afterLogId").value("after-log-1"));
    }
}
