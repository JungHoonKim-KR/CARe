package com.care.domain.reservation.service;

import com.care.domain.car.entity.OwnedCar;
import com.care.domain.company.entity.Company;
import com.care.domain.reservation.controller.dto.request.DisputeCreateRequest;
import com.care.domain.reservation.controller.dto.request.DisputeDefenseRequest;
import com.care.domain.reservation.controller.dto.request.DisputeSettleRequest;
import com.care.domain.reservation.controller.dto.response.DisputeCreateResponse;
import com.care.domain.reservation.controller.dto.response.DisputeDefenseResponse;
import com.care.domain.reservation.controller.dto.response.DisputeDetailResponse;
import com.care.domain.reservation.controller.dto.response.DisputeSettleResponse;
import com.care.domain.reservation.entity.Dispute;
import com.care.domain.reservation.entity.Reservation;
import com.care.domain.reservation.entity.Scratch;
import com.care.domain.reservation.repository.DisputeRepository;
import com.care.domain.reservation.repository.ReservationRepository;
import com.care.domain.reservation.repository.SettlementRepository;
import com.care.domain.renter.entity.Renter;
import com.care.domain.scan.repository.ScratchRepository;
import com.care.global.blockchain.CareTokenService;
import com.care.global.blockchain.DisputeSettlementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock
    private DisputeRepository disputeRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ScratchRepository scratchRepository;

    @Mock
    private SettlementRepository settlementRepository;

    @Mock
    private DisputeSettlementService disputeSettlementService;

    @Mock
    private CareTokenService careTokenService;

    @InjectMocks
    private DisputeService disputeService;

    private Reservation reservation;
    private Scratch targetScratch;
    private Scratch defenseScratch;

    @BeforeEach
    void setUp() {
        reservation = mockReservation("reservation-1", "company-1", "renter-1");
        targetScratch = mockScratch("after-log-1", "AFTER", reservation, false);
        defenseScratch = mockScratch("before-log-1", "BEFORE", reservation, false);
    }

    @Test
    void 분쟁_생성_성공() {
        // given
        DisputeCreateRequest request = new DisputeCreateRequest();
        setField(request, "targetLogId", "after-log-1");
        setField(request, "reason", "문콕 흔적이 반납 후 확인됨");
        setField(request, "claimAmount", 120000);

        given(reservationRepository.findByReservationId("reservation-1"))
                .willReturn(Optional.of(reservation));
        given(scratchRepository.findById("after-log-1"))
                .willReturn(Optional.of(targetScratch));
        given(disputeRepository.existsByTargetScratch_LogIdAndStatusNot("after-log-1", "RESOLVED"))
                .willReturn(false);
        given(disputeRepository.save(any(Dispute.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        DisputeCreateResponse response = disputeService.createDispute("company-1", "reservation-1", request);

        // then
        assertThat(response.reservationId()).isEqualTo("reservation-1");
        assertThat(response.targetLogId()).isEqualTo("after-log-1");
        assertThat(response.status()).isEqualTo("OPEN");
        assertThat(response.claimAmount()).isEqualTo(120000);

        verify(targetScratch).markDisputed();

        ArgumentCaptor<Dispute> captor = ArgumentCaptor.forClass(Dispute.class);
        verify(disputeRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo("OPEN");
    }

    @Test
    void 분쟁_생성_실패_target이_AFTER가_아니면_예외() {
        // given
        Scratch beforeScratch = mockScratch("before-log-x", "BEFORE", reservation, false);

        DisputeCreateRequest request = new DisputeCreateRequest();
        setField(request, "targetLogId", "before-log-x");
        setField(request, "reason", "사유");
        setField(request, "claimAmount", 1000);

        given(reservationRepository.findByReservationId("reservation-1"))
                .willReturn(Optional.of(reservation));
        given(scratchRepository.findById("before-log-x"))
                .willReturn(Optional.of(beforeScratch));

        // when & then
        assertThatThrownBy(() -> disputeService.createDispute("company-1", "reservation-1", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("AFTER");
    }

    @Test
    void 분쟁_방어_성공() {
        // given
        Dispute dispute = Dispute.create(reservation, targetScratch, "사유", 50000);

        DisputeDefenseRequest request = new DisputeDefenseRequest();
        setField(request, "defenseLogId", "before-log-1");

        given(disputeRepository.findByDisputeIdAndReservation_ReservationId("dispute-1", "reservation-1"))
                .willReturn(Optional.of(dispute));
        given(scratchRepository.findById("before-log-1"))
                .willReturn(Optional.of(defenseScratch));

        // when
        DisputeDefenseResponse response = disputeService.defendDispute("renter-1", "reservation-1", "dispute-1", request);

        // then
        assertThat(response.status()).isEqualTo("DEFENDED");
        assertThat(response.defenseLogId()).isEqualTo("before-log-1");
    }

    @Test
    void 분쟁_상세_조회_실패_참여자가_아니면_예외() {
        // given
        Dispute dispute = Dispute.create(reservation, targetScratch, "사유", 50000);
        given(disputeRepository.findByDisputeIdAndReservation_ReservationId("dispute-1", "reservation-1"))
                .willReturn(Optional.of(dispute));

        // when & then
        assertThatThrownBy(() -> disputeService.getDisputeDetail("other-user", "reservation-1", "dispute-1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("조회 권한");
    }

    @Test
    void 분쟁_정산_COMPLETED_성공_자동이체_렌터에서_회사로() throws Exception {
        // given
        Dispute dispute = Dispute.create(reservation, targetScratch, "사유", 50000);
        DisputeSettleRequest request = new DisputeSettleRequest();
        setField(request, "finalAmount", 120000L);
        setField(request, "status", "COMPLETED");

        given(disputeRepository.findByDisputeId("dispute-1")).willReturn(Optional.of(dispute));
        given(settlementRepository.save(any())).willAnswer(invocation -> invocation.getArgument(0));
        given(disputeSettlementService.recordSettlement(any(), anyLong())).willReturn("0xrecord");
        given(careTokenService.transfer("0xrenter", "0xcompany", 120000d)).willReturn("0xusdc");

        // when
        DisputeSettleResponse response = disputeService.settleDispute("company-1", "dispute-1", request);

        // then
        assertThat(response.finalAmount()).isEqualTo(120000L);
        assertThat(response.status()).isEqualTo("COMPLETED");
        assertThat(response.txHash()).isEqualTo("0xusdc");
        verify(disputeSettlementService).recordSettlement(any(), anyLong());
        verify(careTokenService).transfer("0xrenter", "0xcompany", 120000d);
        verify(targetScratch).clearDisputed();
    }

    @Test
    void 분쟁_정산_REFUNDED_성공_자동이체_회사에서_렌터로() throws Exception {
        // given
        Dispute dispute = Dispute.create(reservation, targetScratch, "사유", 50000);
        DisputeSettleRequest request = new DisputeSettleRequest();
        setField(request, "finalAmount", 10000L);
        setField(request, "status", "REFUNDED");

        given(disputeRepository.findByDisputeId("dispute-2")).willReturn(Optional.of(dispute));
        given(settlementRepository.save(any())).willAnswer(invocation -> invocation.getArgument(0));
        given(disputeSettlementService.recordSettlement(any(), anyLong())).willReturn("0xrecord2");
        given(careTokenService.transfer("0xcompany", "0xrenter", 10000d)).willReturn("0xrefund");

        // when
        DisputeSettleResponse response = disputeService.settleDispute("company-1", "dispute-2", request);

        // then
        assertThat(response.status()).isEqualTo("REFUNDED");
        assertThat(response.txHash()).isEqualTo("0xrefund");
        verify(careTokenService).transfer("0xcompany", "0xrenter", 10000d);
    }

    @Test
    void 분쟁_정산_실패_Pending_상태요청() {
        // given
        Dispute dispute = Dispute.create(reservation, targetScratch, "사유", 50000);
        DisputeSettleRequest request = new DisputeSettleRequest();
        setField(request, "finalAmount", 1000L);
        setField(request, "status", "PENDING");

        given(disputeRepository.findByDisputeId("dispute-3")).willReturn(Optional.of(dispute));

        // when & then
        assertThatThrownBy(() -> disputeService.settleDispute("company-1", "dispute-3", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PENDING");
    }

    private Reservation mockReservation(String reservationId, String companyId, String renterId) {
        Reservation reservationMock = org.mockito.Mockito.mock(Reservation.class);
        OwnedCar ownedCarMock = org.mockito.Mockito.mock(OwnedCar.class);
        Company companyMock = org.mockito.Mockito.mock(Company.class);
        Renter renterMock = org.mockito.Mockito.mock(Renter.class);

        lenient().when(reservationMock.getReservationId()).thenReturn(reservationId);
        lenient().when(reservationMock.getOwnedCar()).thenReturn(ownedCarMock);
        lenient().when(ownedCarMock.getCompany()).thenReturn(companyMock);
        lenient().when(companyMock.getCompanyId()).thenReturn(companyId);
        lenient().when(companyMock.getWalletAddress()).thenReturn("0xcompany");
        lenient().when(reservationMock.getRenter()).thenReturn(renterMock);
        lenient().when(renterMock.getUserId()).thenReturn(renterId);
        lenient().when(renterMock.getWalletAddress()).thenReturn("0xrenter");

        return reservationMock;
    }

    private Scratch mockScratch(String logId, String logType, Reservation reservation, boolean isDisputed) {
        Scratch scratchMock = org.mockito.Mockito.mock(Scratch.class);
        lenient().when(scratchMock.getLogId()).thenReturn(logId);
        lenient().when(scratchMock.getLogType()).thenReturn(logType);
        lenient().when(scratchMock.getReservation()).thenReturn(reservation);
        lenient().when(scratchMock.isDisputed()).thenReturn(isDisputed);
        return scratchMock;
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
