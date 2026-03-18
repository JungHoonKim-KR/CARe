package com.care.domain.car.controller.dto.request;

import org.springframework.web.multipart.MultipartFile;

public record CarRegisterRequest(
        String modelId,
        String plateNumber,
        MultipartFile frontImage,
        MultipartFile rearImage,
        MultipartFile leftImage,
        MultipartFile rightImage
) {}
