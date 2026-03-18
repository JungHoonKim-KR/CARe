package com.care.domain.car.controller;

import com.care.domain.car.controller.dto.request.CarRegisterRequest;
import com.care.domain.car.controller.dto.response.CarImageResponse;
import com.care.domain.car.controller.dto.response.CarRegisterResponse;
import com.care.domain.car.service.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/companies/{companyId}/cars")
public class CarController {

    private final CarService carService;

    /**
     * POST /companies/{companyId}/cars
     * 차량 등록 및 NFT 발급 (비동기)
     * multipart/form-data: modelId, plateNumber, frontImage, rearImage, leftImage, rightImage
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<CarRegisterResponse> registerCar(
            @PathVariable String companyId,
            @RequestPart String modelId,
            @RequestPart String plateNumber,
            @RequestPart MultipartFile frontImage,
            @RequestPart MultipartFile rearImage,
            @RequestPart MultipartFile leftImage,
            @RequestPart MultipartFile rightImage
    ) {
        CarRegisterRequest request = new CarRegisterRequest(modelId, plateNumber, frontImage, rearImage, leftImage, rightImage);
        CarRegisterResponse response = carService.registerCar(companyId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /companies/{companyId}/cars/{carId}/images
     * 특정 차량의 이미지 목록 조회 (S3 URL + IPFS CID)
     */
    @GetMapping("/{carId}/images")
    public ResponseEntity<List<CarImageResponse>> getCarImages(
            @PathVariable String companyId,
            @PathVariable String carId
    ) {
        return ResponseEntity.ok(carService.getCarImages(companyId, carId));
    }
}
