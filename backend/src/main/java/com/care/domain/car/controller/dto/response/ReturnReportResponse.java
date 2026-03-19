package com.care.domain.car.controller.dto.response;

import com.care.domain.reservation.entity.Scratch;

import java.time.LocalDateTime;
import java.util.List;

public record ReturnReportResponse(
        String reservationId,
        String carId,
        List<ScratchDetail> scratches
) {
    public record ScratchDetail(
            String logId,
            String logType,
            String carPart,
            float coordX,
            float coordY,
            String originalS3Url,
            String cropS3Url,
            String proofIpfsCid,
            boolean isManual,
            boolean isDisputed,
            LocalDateTime createdAt
    ) {
        public static ScratchDetail from(Scratch scratch) {
            return new ScratchDetail(
                    scratch.getLogId(),
                    scratch.getLogType(),
                    scratch.getCarPart(),
                    scratch.getCoordX(),
                    scratch.getCoordY(),
                    scratch.getOriginalS3Url(),
                    scratch.getCropS3Url(),
                    scratch.getProofIpfsCid(),
                    scratch.isManual(),
                    scratch.isDisputed(),
                    scratch.getCreatedAt()
            );
        }
    }

    public static ReturnReportResponse of(String reservationId, String carId, List<Scratch> scratches) {
        return new ReturnReportResponse(
                reservationId,
                carId,
                scratches.stream().map(ScratchDetail::from).toList()
        );
    }
}
