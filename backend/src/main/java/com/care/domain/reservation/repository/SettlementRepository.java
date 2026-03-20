package com.care.domain.reservation.repository;

import com.care.domain.reservation.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, String> {

    List<Settlement> findAllByReservation_ReservationIdOrderByCreatedAtDesc(String reservationId);
}