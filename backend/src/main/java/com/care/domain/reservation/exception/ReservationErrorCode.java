package com.care.domain.reservation.exception;

import com.care.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ReservationErrorCode implements ErrorCode {

    RESERVATION_NOT_FOUND("존재하지 않는 예약입니다.", HttpStatus.NOT_FOUND),
    CAR_NOT_FOUND("존재하지 않는 차량입니다.", HttpStatus.NOT_FOUND),
    INSURANCE_NOT_FOUND("존재하지 않는 보험입니다.", HttpStatus.NOT_FOUND),
    WALLET_NOT_REGISTERED("지갑이 등록되지 않았습니다.", HttpStatus.BAD_REQUEST),
    PAYMENT_FAILED("결제에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),
    INSUFFICIENT_BALANCE("잔액이 부족합니다.", HttpStatus.BAD_REQUEST);

    private final String message;
    private final HttpStatus httpStatus;
}
