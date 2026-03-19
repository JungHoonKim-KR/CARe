package com.care.domain.car.controller.dto.response;

import com.care.domain.car.entity.OwnedCar;

public record RenterCarResponse(
        String carId,
        String plateNumber,
        String brand,
        String modelName,
        String fuelType,
        String airportCode,
        String companyName,
        String frontImageUrl
) {
    public static RenterCarResponse of(OwnedCar car, String frontImageUrl) {
        return new RenterCarResponse(
                car.getCarId(),
                car.getPlateNumber(),
                car.getCarModel().getBrand(),
                car.getCarModel().getModelName(),
                car.getCarModel().getFuelType(),
                car.getCompany().getAirportCode(),
                car.getCompany().getName(),
                frontImageUrl
        );
    }
}
