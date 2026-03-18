package com.care.domain.car.repository;

import com.care.domain.car.entity.OwnedCar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnedCarRepository extends JpaRepository<OwnedCar, String> {
}
