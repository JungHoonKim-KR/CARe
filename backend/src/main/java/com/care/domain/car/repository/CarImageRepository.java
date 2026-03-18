package com.care.domain.car.repository;

import com.care.domain.car.entity.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarImageRepository extends JpaRepository<CarImage, String> {
    List<CarImage> findByCarCarId(String carId);
}
