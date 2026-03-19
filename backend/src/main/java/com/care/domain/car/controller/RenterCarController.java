package com.care.domain.car.controller;

import com.care.domain.car.controller.dto.response.RenterCarResponse;
import com.care.domain.car.service.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/renters/cars")
public class RenterCarController {

    private final CarService carService;

    /**
     * GET /renters/cars?brand=현대&airportCode=ICN
     * 차량 목록 조회 (브랜드, 공항 필터 - 선택)
     */
    @GetMapping
    public ResponseEntity<List<RenterCarResponse>> getCarList(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String airportCode
    ) {
        return ResponseEntity.ok(carService.getRenterCarList(brand, airportCode));
    }
}
